import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { pool, initDb } from './db';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compareSync(plain, hashed);
}

export async function createAccessToken(userId: number, email: string) {
  return new SignJWT({ sub: String(userId), email, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret());
}

export async function createRefreshToken(userId: number) {
  return new SignJWT({ sub: String(userId), type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
}

export async function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  try {
    const payload = await verifyAccessToken(token);
    const { rows } = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [Number(payload.sub)]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function ensureAdminExists() {
  await initDb();
  const email = process.env.ADMIN_EMAIL ?? 'admin@roofscanada.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const { rows } = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
  if (rows.length === 0) {
    await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, 'Admin', 'admin')",
      [email, hashPassword(password)]
    );
  } else if (!verifyPassword(password, rows[0].password_hash)) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashPassword(password), email]);
  }
}
