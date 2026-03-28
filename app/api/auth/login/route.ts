import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyPassword, createAccessToken, createRefreshToken, ensureAdminExists } from '@/lib/auth';

const isProd = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  try {
    await ensureAdminExists();
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ detail: 'Email and password required' }, { status: 400 });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(user.id, user.email),
      createRefreshToken(user.id),
    ]);

    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.cookies.set('access_token', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 900, path: '/' });
    res.cookies.set('refresh_token', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 604800, path: '/' });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
