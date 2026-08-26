import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import https from 'https';

const CACHE_DIR = path.resolve(process.cwd(), 'data', 'image_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Trusted domains whitelist to prevent open proxy security vulnerabilities
const ALLOWED_DOMAINS = ['eg.jumia.is', 'images.unsplash.com', 'jumia.is', 'unsplash.com'];

// Deduplication map for pending simultaneous requests
const pendingDownloads = new Map();

function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export async function handleImageThumbnailProxy(req, res) {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).json({ error: 'Missing image url parameter' });
    }

    const decodedUrl = decodeURIComponent(rawUrl);
    let parsedUrl;
    try {
      parsedUrl = new URL(decodedUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Validate Domain Whitelist
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    if (!isAllowed) {
      return res.status(403).json({ error: 'Domain not allowed in image proxy whitelist' });
    }

    const urlHash = hashUrl(decodedUrl);
    const cachedFilePath = path.join(CACHE_DIR, `${urlHash}.jpg`);
    const metaFilePath = path.join(CACHE_DIR, `${urlHash}.meta`);

    // Check Local Disk Cache (Warm Hit: < 5ms)
    if (fs.existsSync(cachedFilePath)) {
      let contentType = 'image/jpeg';
      try {
        if (fs.existsSync(metaFilePath)) {
          contentType = fs.readFileSync(metaFilePath, 'utf8') || 'image/jpeg';
        }
      } catch (e) {}

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Cache-Status', 'HIT');
      return fs.createReadStream(cachedFilePath).pipe(res);
    }

    // Handle Duplicate Simultaneous Downloads (Deduplication)
    if (pendingDownloads.has(urlHash)) {
      await pendingDownloads.get(urlHash);
      if (fs.existsSync(cachedFilePath)) {
        let contentType = 'image/jpeg';
        try {
          if (fs.existsSync(metaFilePath)) {
            contentType = fs.readFileSync(metaFilePath, 'utf8') || 'image/jpeg';
          }
        } catch (e) {}

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('X-Cache-Status', 'HIT');
        return fs.createReadStream(cachedFilePath).pipe(res);
      }
    }

    // Cold Fetch from Upstream CDN
    const fetchPromise = new Promise((resolve, reject) => {
      const client = parsedUrl.protocol === 'https:' ? https : http;
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      };

      const upstreamReq = client.request(requestOptions, (upstreamRes) => {
        if (upstreamRes.statusCode >= 300 && upstreamRes.statusCode < 400 && upstreamRes.headers.location) {
          const redirectUrl = new URL(upstreamRes.headers.location, decodedUrl).toString();
          return resolve({ redirect: redirectUrl });
        }

        if (upstreamRes.statusCode !== 200) {
          return reject(new Error(`Upstream returned HTTP ${upstreamRes.statusCode}`));
        }

        const contentType = upstreamRes.headers['content-type'] || 'image/jpeg';
        const chunks = [];

        upstreamRes.on('data', (chunk) => chunks.push(chunk));
        upstreamRes.on('end', () => {
          const buffer = Buffer.concat(chunks);
          try {
            fs.writeFileSync(cachedFilePath, buffer);
            fs.writeFileSync(metaFilePath, contentType);
          } catch (e) {
            console.warn('[Image Proxy Cache Write Error]:', e.message);
          }
          resolve({ buffer, contentType });
        });
        upstreamRes.on('error', reject);
      });

      upstreamReq.on('error', reject);
      upstreamReq.end();
    });

    pendingDownloads.set(urlHash, fetchPromise);

    let result;
    try {
      result = await fetchPromise;
    } finally {
      pendingDownloads.delete(urlHash);
    }

    if (result.redirect) {
      req.query.url = encodeURIComponent(result.redirect);
      return handleImageThumbnailProxy(req, res);
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Cache-Status', 'MISS');
    res.send(result.buffer);

  } catch (err) {
    console.error('[Image Proxy Error]:', err.message);
    res.status(502).json({ error: 'Failed to fetch upstream product image', details: err.message });
  }
}
