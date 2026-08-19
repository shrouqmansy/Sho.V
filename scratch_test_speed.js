import pg from 'pg';

const passwordRaw = '12345#SHO@##$E';
const passwordEncoded = encodeURIComponent(passwordRaw);

// Compare Port 6543 (Transaction Pooler) vs Port 5432 (Session Pooler / Direct)
const uri6543 = `postgres://postgres.lhvnmxsmnugetidkxrxo:${passwordEncoded}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;
const uri5432 = `postgres://postgres.lhvnmxsmnugetidkxrxo:${passwordEncoded}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`;

async function testSpeed(label, uri) {
  console.log(`\nTesting ${label}...`);
  const start = Date.now();
  const pool = new pg.Pool({
    connectionString: uri,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 5000
  });

  try {
    const client = await pool.connect();
    const connTime = Date.now() - start;
    console.log(`  Connection established in ${connTime} ms`);

    const qStart = Date.now();
    const res = await client.query('SELECT * FROM products LIMIT 50;');
    const qTime = Date.now() - qStart;
    console.log(`  Fetched ${res.rows.length} products in ${qTime} ms`);

    client.release();
    await pool.end();
    return qTime;
  } catch (err) {
    console.error(`  Error on ${label}:`, err.message);
    await pool.end();
    return null;
  }
}

async function run() {
  await testSpeed('Port 6543 (Transaction Pooler)', uri6543);
  await testSpeed('Port 5432 (Session Pooler)', uri5432);
}

run();
