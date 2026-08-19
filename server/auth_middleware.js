import jwt from 'jsonwebtoken';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shov_secret_jwt_key_9948210385710298374092183';

export { JWT_SECRET };

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, error: 'Invalid or expired access token' });
    }

    // Verify user exists in PostgreSQL
    const userRes = await query(`SELECT id, email, name FROM users WHERE id = $1`, [decoded.userId]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User account not found' });
    }

    req.user = userRes.rows[0];
    req.sessionId = decoded.sessionId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

export async function resolveTenant(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required before tenant resolution' });
    }

    // STRICT SECURITY RULE: NEVER accept tenant_id from req.body, req.query, or req.headers!
    // Derive tenant identity strictly from authenticated user_tenants database records
    const tenantRes = await query(
      `SELECT t.id, t.name, t.slug, t.owner_user_id, ut.role
       FROM tenants t
       JOIN user_tenants ut ON t.id = ut.tenant_id
       WHERE ut.user_id = $1
       ORDER BY t.created_at ASC
       LIMIT 1`,
      [req.user.id]
    );

    if (tenantRes.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'No active tenant workspace found for this account' });
    }

    req.tenant = {
      id: tenantRes.rows[0].id,
      name: tenantRes.rows[0].name,
      slug: tenantRes.rows[0].slug,
      owner_user_id: tenantRes.rows[0].owner_user_id
    };
    req.userRole = tenantRes.rows[0].role;

    next();
  } catch (err) {
    console.error('[resolveTenant Error]:', err);
    return res.status(500).json({ success: false, error: 'Internal server error resolving tenant identity' });
  }
}

export function requireTenantRole(roles = ['owner']) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions for this tenant operation' });
    }
    next();
  };
}
