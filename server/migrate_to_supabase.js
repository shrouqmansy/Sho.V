import pg from 'pg';
import fs from 'fs';
import path from 'path';

const passwordRaw = '12345#SHO@##$E';
const passwordEncoded = encodeURIComponent(passwordRaw);

// Connection URI provided by user: aws-1-eu-west-1.pooler.supabase.com:6543
const targetUri = `postgres://postgres.lhvnmxsmnugetidkxrxo:${passwordEncoded}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

async function testAndMigrate() {
  const safeString = targetUri.replace(passwordEncoded, '*****');
  console.log(`\nConnecting to Supabase Cloud Database: ${safeString}`);
  
  const pool = new pg.Pool({
    connectionString: targetUri,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    const client = await pool.connect();
    console.log('✅ CONNECTED SUCCESSFULLY TO SUPABASE POSTGRESQL CLOUD!');
    const res = await client.query('SELECT current_database(), version();');
    console.log('   Cloud Database:', res.rows[0].current_database);
    console.log('   PostgreSQL Version:', res.rows[0].version);

    // Read and execute database_dump.sql
    console.log('\n[Supabase Migration] Reading server/database_dump.sql...');
    const sqlDumpPath = path.resolve(process.cwd(), 'server', 'database_dump.sql');
    const sqlDump = fs.readFileSync(sqlDumpPath, 'utf-8');

    console.log('[Supabase Migration] Uploading products, images, colors, sizes, SKUs, and inventory to Supabase...');
    await client.query(sqlDump);

    // Create auth and multi-tenant schema tables
    console.log('[Supabase Migration] Creating Auth & Multi-tenant tables in Supabase...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(50) DEFAULT 'FREE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_accounts (
        id VARCHAR(64) PRIMARY KEY,
        tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'TENANT_ADMIN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_events (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        session_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64),
        color VARCHAR(50),
        size VARCHAR(20),
        sku_id VARCHAR(64),
        event_type VARCHAR(50) NOT NULL,
        search_query TEXT,
        category VARCHAR(100),
        brand VARCHAR(100),
        price NUMERIC,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verify product & user counts in Supabase
    const prodCountRes = await client.query('SELECT COUNT(*) FROM products;');
    const colorCountRes = await client.query('SELECT COUNT(*) FROM product_colors;');
    const skuCountRes = await client.query('SELECT COUNT(*) FROM product_skus;');

    console.log('\n===========================================================');
    console.log('  🎉 SUPABASE CLOUD DATABASE MIGRATION 100% SUCCESSFUL!    ');
    console.log('===========================================================');
    console.log(`  * Total Products Uploaded to Supabase : ${prodCountRes.rows[0].count}`);
    console.log(`  * Total Color Swatches Uploaded       : ${colorCountRes.rows[0].count}`);
    console.log(`  * Total SKUs & Inventory Uploaded     : ${skuCountRes.rows[0].count}`);
    console.log('===========================================================\n');

    client.release();
    await pool.end();

    // Update .env file with valid DATABASE_URL
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${targetUri}"`);
    } else {
      envContent += `\nDATABASE_URL="${targetUri}"\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('Saved working Supabase DATABASE_URL to .env file!');
    return true;
  } catch (err) {
    console.error('❌ Connection/Migration Error:', err.message);
    await pool.end();
    return false;
  }
}

testAndMigrate().then(success => {
  process.exit(success ? 0 : 1);
});
