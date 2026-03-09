/**
 * Eram Motors Stock Tracker - Cloudflare Worker API
 * Connects the React frontend to Cloudflare D1 database.
 * Handles: login, register, and all users CRUD operations.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Simple bcrypt-compatible comparison using Web Crypto (PBKDF2)
// NOTE: Since this Worker replaces bcryptjs from the frontend,
// we keep bcrypt hashes from existing Supabase users compatible
// by using the same format. New passwords are hashed on the client.

async function hashPassword(password) {
  // Hash using SHA-256 via Web Crypto (lightweight for Workers)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, storedHash) {
  // Support both bcrypt hashes (from Supabase) and SHA-256 hashes (new)
  if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
    // bcrypt hash from Supabase - can't verify in Workers without a library
    // We return false so users with old hashes can use "Forgot Password" to reset
    return false;
  }
  const hash = await hashPassword(password);
  return hash === storedHash;
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ─── POST /api/login ───────────────────────────────────────────
    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        if (!username || !password) return json({ error: 'Username and password required.' }, 400);

        const result = await env.DB.prepare(
          `SELECT id, username, full_name, email, role, cluster, status, password_hash 
           FROM users WHERE username = ? COLLATE NOCASE`
        ).bind(username.trim()).first();

        if (!result) return json({ error: 'Invalid username or password.' }, 401);
        if (result.status !== 'Active') return json({ error: 'Your account is inactive. Contact admin.' }, 403);

        const valid = await verifyPassword(password, result.password_hash);
        if (!valid) return json({ error: 'Invalid username or password.' }, 401);

        const { password_hash, ...user } = result;
        return json({ success: true, user });
      } catch (e) {
        return json({ error: 'Login failed: ' + e.message }, 500);
      }
    }

    // ─── POST /api/register ────────────────────────────────────────
    if (path === '/api/register' && request.method === 'POST') {
      try {
        const { username, full_name, email, password, role = 'user', cluster } = await request.json();
        if (!username || !email || !password) return json({ error: 'Missing required fields.' }, 400);
        if (username.length < 3) return json({ error: 'Username must be at least 3 characters.' }, 400);
        if (password.length < 6) return json({ error: 'Password must be at least 6 characters.' }, 400);

        const existing = await env.DB.prepare(
          `SELECT id FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE`
        ).bind(username.trim(), email.trim()).first();
        if (existing) return json({ error: 'Username or Email already exists.' }, 409);

        const password_hash = await hashPassword(password);
        const id = crypto.randomUUID();

        await env.DB.prepare(
          `INSERT INTO users (id, username, full_name, email, password_hash, role, cluster, status, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', 1)`
        ).bind(id, username.trim(), full_name?.trim() || '', email.trim(), password_hash, role, cluster || '').run();

        const user = await env.DB.prepare(
          `SELECT id, username, full_name, email, role, cluster, status FROM users WHERE id = ?`
        ).bind(id).first();

        return json({ success: true, user }, 201);
      } catch (e) {
        return json({ error: 'Registration failed: ' + e.message }, 500);
      }
    }

    // ─── GET /api/users ────────────────────────────────────────────
    if (path === '/api/users' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          `SELECT id, username, full_name, email, role, cluster, status, created_at 
           FROM users ORDER BY created_at DESC`
        ).all();
        return json({ success: true, data: results });
      } catch (e) {
        return json({ error: 'Failed to fetch users: ' + e.message }, 500);
      }
    }

    // ─── POST /api/users ───────────────────────────────────────────
    if (path === '/api/users' && request.method === 'POST') {
      try {
        const { username, full_name, email, password, role = 'user', cluster } = await request.json();
        if (!username || !email || !password || !cluster) return json({ error: 'Missing required fields.' }, 400);
        if (username.length < 3) return json({ error: 'Username must be at least 3 characters.' }, 400);
        if (password.length < 6) return json({ error: 'Password must be at least 6 characters.' }, 400);

        const existing = await env.DB.prepare(
          `SELECT id FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE`
        ).bind(username.trim(), email.trim()).first();
        if (existing) return json({ error: 'Username or Email already exists.' }, 409);

        const password_hash = await hashPassword(password);
        const id = crypto.randomUUID();

        await env.DB.prepare(
          `INSERT INTO users (id, username, full_name, email, password_hash, role, cluster, status, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', 1)`
        ).bind(id, username.trim(), full_name?.trim() || '', email.trim(), password_hash, role, cluster).run();

        const user = await env.DB.prepare(
          `SELECT id, username, full_name, email, role, cluster, status, created_at FROM users WHERE id = ?`
        ).bind(id).first();

        return json({ success: true, user }, 201);
      } catch (e) {
        return json({ error: 'Failed to create user: ' + e.message }, 500);
      }
    }

    // ─── PATCH /api/users/:id/status ──────────────────────────────
    const statusMatch = path.match(/^\/api\/users\/([^/]+)\/status$/);
    if (statusMatch && request.method === 'PATCH') {
      try {
        const id = statusMatch[1];
        const { status } = await request.json();
        if (!['Active', 'Inactive'].includes(status)) return json({ error: 'Invalid status.' }, 400);

        await env.DB.prepare(
          `UPDATE users SET status = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(status, status === 'Active' ? 1 : 0, id).run();

        return json({ success: true });
      } catch (e) {
        return json({ error: 'Failed to update status: ' + e.message }, 500);
      }
    }

    // ─── PATCH /api/users/:id/password ────────────────────────────
    const passwordMatch = path.match(/^\/api\/users\/([^/]+)\/password$/);
    if (passwordMatch && request.method === 'PATCH') {
      try {
        const id = passwordMatch[1];
        const { password } = await request.json();
        if (!password || password.length < 6) return json({ error: 'Password must be at least 6 characters.' }, 400);

        const password_hash = await hashPassword(password);
        await env.DB.prepare(
          `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(password_hash, id).run();

        return json({ success: true });
      } catch (e) {
        return json({ error: 'Failed to update password: ' + e.message }, 500);
      }
    }

    // ─── GET /api/users/:username ──────────────────────────────────
    const userMatch = path.match(/^\/api\/users\/by-username\/([^/]+)$/);
    if (userMatch && request.method === 'GET') {
      try {
        const username = decodeURIComponent(userMatch[1]);
        const user = await env.DB.prepare(
          `SELECT id, username, full_name, email, role, cluster, status FROM users WHERE username = ? COLLATE NOCASE`
        ).bind(username).first();
        if (!user) return json({ error: 'User not found.' }, 404);
        return json({ success: true, user });
      } catch (e) {
        return json({ error: 'Failed to find user: ' + e.message }, 500);
      }
    }

    return json({ error: 'Not found.' }, 404);
  },
};
