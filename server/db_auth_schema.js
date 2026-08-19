import { query } from './db.js';

export async function initAuthDb() {
  console.log('Setting up Auth & Multi-Tenancy PostgreSQL schemas...');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id VARCHAR(64) PRIMARY KEY,
      owner_user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_tenants (
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL DEFAULT 'owner',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, tenant_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tenant_containers (
      id VARCHAR(64) PRIMARY KEY,
      tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
      container_id TEXT NOT NULL,
      container_name TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'provisioning',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Indexes for high performance tenant and user authentication queries
  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_user_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant ON user_tenants(tenant_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_tenant_containers_tenant ON tenant_containers(tenant_id);`);

  console.log('Auth & Multi-Tenancy PostgreSQL schemas ready.');
}
