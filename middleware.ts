import { NextRequest, NextResponse } from 'next/server';

async function computeToken(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Search-indexing policy by host.
 * Only the host named in INDEX_ALLOW_HOST (and its www-variant) may be indexed.
 * Everything else — the test domain, the *.up.railway.app URL — gets a
 * `X-Robots-Tag: noindex` header so Google does NOT take it up.
 * If INDEX_ALLOW_HOST is unset, nothing is indexable (safe default for staging).
 * To go live on the real domain, set INDEX_ALLOW_HOST=makarim.de on Railway.
 */
function isIndexAllowed(host: string): boolean {
  const allow = process.env.INDEX_ALLOW_HOST?.trim().toLowerCase();
  if (!allow) return false;
  const bare = (h: string) => h.toLowerCase().split(':')[0].replace(/^www\./, '');
  return bare(host) === bare(allow);
}

async function isAdminAuthed(request: NextRequest): Promise<boolean> {
  const session  = request.cookies.get('makarim_session')?.value ?? '';
  const password = process.env.ADMIN_PASSWORD ?? 'makarim2024';
  const salt     = process.env.ADMIN_SALT     ?? 'makarim-cms-salt-2024';
  const expected = await computeToken(password, salt);
  return !!session && session === expected;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // Decide the base response: protect /admin (login page stays public).
  let response: NextResponse;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (await isAdminAuthed(request)) {
      response = NextResponse.next();
    } else {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      response = NextResponse.redirect(loginUrl);
    }
  } else {
    response = NextResponse.next();
  }

  // Block search indexing on every non-production host.
  if (!isIndexAllowed(host)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  // Run on all routes except Next internals and static assets, so the
  // noindex header is applied site-wide (admin auth still only acts on /admin).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
