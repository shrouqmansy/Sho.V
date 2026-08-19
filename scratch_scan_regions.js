import pg from 'pg';

const projectRef = 'lhvnmxsmnugetidkxrxo';
const passwordRaw = '12345#SHO@##$E';
const passwordEncoded = encodeURIComponent(passwordRaw);

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'eu-south-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
  'sa-east-1', 'af-south-1', 'ca-central-1', 'me-central-1', 'me-south-1'
];

async function main() {
  console.log(`Scanning all 21 Supabase regions for project ${projectRef}...`);

  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    const user = `postgres.${projectRef}`;
    const uri = `postgres://${user}:${passwordEncoded}@${host}:6543/postgres`;

    const pool = new pg.Pool({
      connectionString: uri,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });

    try {
      const client = await pool.connect();
      console.log(`\n🎉 FOUND IT! Supabase Project Region is: ${r}!`);
      console.log(`  Working URI: ${uri.replace(passwordEncoded, '*****')}`);
      const res = await client.query('SELECT current_database(), version();');
      console.log('  Database:', res.rows[0].current_database);
      console.log('  Version:', res.rows[0].version);
      client.release();
      await pool.end();
      return uri;
    } catch (e) {
      const err = e.message;
      if (!err.includes('not found') && !err.includes('getaddrinfo') && !err.includes('timeout')) {
        console.log(`   Region ${r} -> ${err}`);
      }
      await pool.end();
    }
  }

  console.log('Finished scanning all regions.');
}

main();
