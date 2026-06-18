import { NextRequest, NextResponse } from 'next/server';

async function computeToken(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes; login page itself is public
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const session  = request.cookies.get('makarim_session')?.value ?? '';
  const password = process.env.ADMIN_PASSWORD ?? 'makarim2024';
  const salt     = process.env.ADMIN_SALT     ?? 'makarim-cms-salt-2024';
  const expected = await computeToken(password, salt);

  if (session !== expected) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
