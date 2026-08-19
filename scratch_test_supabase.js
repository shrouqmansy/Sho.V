import pg from 'pg';

const projectRef = 'lhvnmxsmnugetidkxrxo';
const passwordRaw = '12345#SHO@##$E';
const passwordEncoded = encodeURIComponent(passwordRaw);

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'sa-east-1', 'ca-central-1'
];

async function tryConnect(host, port, user) {
  const uri = `postgres://${user}:${passwordEncoded}@${host}:${port}/postgres`;
  const pool = new pg.Pool({
    connectionString: uri,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    const client = await pool.connect();
    console.log(`\n🎉 SUCCESS! Connected to ${host}:${port} with user '${user}'!`);
    const res = await client.query('SELECT current_database(), version();');
    console.log('   Database:', res.rows[0].current_database);
    console.log('   Version:', res.rows[0].version);
    client.release();
    await pool.end();
    return uri;
  } catch (e) {
    const err = e.message;
    if (!err.includes('not found') && !err.includes('getaddrinfo') && !err.includes('timeout')) {
      console.log(` Attempted ${host}:${port} (${user}) -> Error: ${err.substring(0, 100)}`);
    }
    await pool.end();
    return null;
  }
}

async function main() {
  console.log(`Testing all Supabase connection candidates for project ${projectRef}...`);
  
  // 1. Direct host
  let working = await tryConnect(`db.${projectRef}.supabase.co`, 5432, "postgres");
  if (working) return;

  // 2. Pooler hosts across regions
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    for (const p of [6543, 5432]) {
      for (const u of [`postgres.${projectRef}`, "postgres"]) {
        working = await tryConnect(host, p, u);
        if (working) {
          console.log('\n===========================================================');
          console.log('  WORKING SUPABASE CONNECTION STRING FOUND:');
          console.log('  ' + working.replace(passwordEncoded, '*****'));
          console.log('===========================================================');
          return;
        }
      }
    }
  }
}

main();
