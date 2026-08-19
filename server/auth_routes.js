import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from './db.js';
import { JWT_SECRET, authenticateUser, resolveTenant, requireTenantRole } from './auth_middleware.js';
import { provisionTenantContainer, getTenantContainerStatus, restartTenantContainer } from './container_provisioner.js';

const router = express.Router();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokens(userId, sessionId) {
  const accessToken = jwt.sign(
    { userId, sessionId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
}

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate user
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
    }

    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User
    await query(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, cleanEmail, passwordHash, name.trim()]
    );

    // Create Tenant
    const tenantId = `tnt_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30);
    const slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
    const tenantName = `${name.trim()}'s Workspace`;

    await query(
      `INSERT INTO tenants (id, owner_user_id, name, slug, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [tenantId, userId, tenantName, slug]
    );

    // Create User Tenant Membership
    await query(
      `INSERT INTO user_tenants (user_id, tenant_id, role, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, tenantId, 'owner']
    );

    const tenantObj = { id: tenantId, name: tenantName, slug, owner_user_id: userId };

    // Provision Tenant Isolated Container
    let containerObj = null;
    try {
      containerObj = await provisionTenantContainer(tenantObj);
    } catch (provErr) {
      console.warn(`[Register Provisioning Warning]: ${provErr.message}`);
      containerObj = { tenant_id: tenantId, status: 'provisioning_failed' };
    }

    // Create Session Tokens
    const sessionId = `sess_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const { accessToken, refreshToken } = generateTokens(userId, sessionId);
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      `INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [sessionId, userId, refreshTokenHash, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'Account and workspace registered successfully',
      user: { id: userId, email: cleanEmail, name: name.trim() },
      tenant: tenantObj,
      container: containerObj,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('API Error /api/auth/register:', err.stack || err);
    res.status(500).json({ success: false, error: 'Registration failed due to a server error' });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRes = await query(`SELECT id, email, name, password_hash FROM users WHERE email = $1`, [cleanEmail]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Resolve tenant
    const tenantRes = await query(
      `SELECT t.id, t.name, t.slug, t.owner_user_id
       FROM tenants t
       JOIN user_tenants ut ON t.id = ut.tenant_id
       WHERE ut.user_id = $1
       ORDER BY t.created_at ASC LIMIT 1`,
      [user.id]
    );

    const tenantObj = tenantRes.rows[0] || null;
    const containerObj = tenantObj ? await getTenantContainerStatus(tenantObj.id) : null;

    // Create session
    const sessionId = `sess_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const { accessToken, refreshToken } = generateTokens(user.id, sessionId);
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [sessionId, user.id, refreshTokenHash, expiresAt]
    );

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      tenant: tenantObj,
      container: containerObj,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('API Error /api/auth/login:', err.stack || err);
    res.status(500).json({ success: false, error: 'Login failed due to a server error' });
  }
});

// 3. POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await query(`DELETE FROM user_sessions WHERE refresh_token_hash = $1`, [hashed]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.json({ success: true, message: 'Logged out' });
  }
});

// 4. POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const hashed = hashToken(refreshToken);
    const sessRes = await query(
      `SELECT id, user_id, expires_at FROM user_sessions WHERE refresh_token_hash = $1 AND expires_at > NOW()`,
      [hashed]
    );

    if (sessRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const session = sessRes.rows[0];
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.user_id, session.id);
    const newHashed = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Rotate refresh token
    await query(
      `UPDATE user_sessions SET refresh_token_hash = $1, expires_at = $2 WHERE id = $3`,
      [newHashed, newExpiresAt, session.id]
    );

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('API Error /api/auth/refresh:', err.stack || err);
    res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
});

// 5. GET /api/auth/me
router.get('/me', authenticateUser, resolveTenant, async (req, res) => {
  try {
    const containerObj = await getTenantContainerStatus(req.tenant.id);
    res.json({
      success: true,
      user: req.user,
      tenant: req.tenant,
      userRole: req.userRole,
      container: containerObj
    });
  } catch (err) {
    console.error('API Error /api/auth/me:', err.stack || err);
    res.status(500).json({ success: false, error: 'Failed to retrieve auth state' });
  }
});

// 6. GET /api/tenant/container
router.get('/tenant/container', authenticateUser, resolveTenant, async (req, res) => {
  try {
    const containerObj = await getTenantContainerStatus(req.tenant.id);
    res.json({
      success: true,
      tenant: req.tenant,
      container: containerObj
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve container status' });
  }
});

// 7. POST /api/tenant/container/restart
router.post('/tenant/container/restart', authenticateUser, resolveTenant, requireTenantRole(['owner']), async (req, res) => {
  try {
    const updated = await restartTenantContainer(req.tenant.id);
    res.json({
      success: true,
      message: 'Container restarted successfully',
      container: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to restart container' });
  }
});

export default router;
