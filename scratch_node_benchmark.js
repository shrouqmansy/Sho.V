import http from 'http';

function get(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`http://localhost:3001${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const elapsed = Date.now() - start;
        let count = 0;
        try {
          const json = JSON.parse(body);
          count = json.count || (json.products ? json.products.length : 0);
        } catch(e) {}
        console.log("  ✅ " + path.padEnd(45) + " | " + elapsed + " ms | Items: " + count);
        resolve(elapsed);
      });
    }).on('error', (e) => {
      console.log(`  ❌ ${path}: ${e.message}`);
      resolve(null);
    });
  });
}

async function main() {
  console.log("===========================================================");
  console.log("      SHO.V BENCHMARK PERFORMANCE RESULTS                  ");
  console.log("===========================================================");
  await get('/api/products?limit=24');
  await get('/api/products?category=Dresses');
  await get('/api/products/search?q=Hoodie');
  await get('/api/products/search?q=Mesh%20Cover');
  await get('/api/recommendations/for-you?sessionId=test_sess_101');
  await get('/api/recommendations/trending');
  await get('/api/products/prod_46f14d947dadd6e2');
  console.log("===========================================================\n");
}

main();
