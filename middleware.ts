import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));

  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.type !== 'access') throw new Error();
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/dashboard', '/admin/settings'],
};
