import { NextRequest, NextResponse } from 'next/server';

async function computeToken(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'makarim2024';
  const salt          = process.env.ADMIN_SALT     ?? 'makarim-cms-salt-2024';

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  const token    = await computeToken(adminPassword, salt);
  const response = NextResponse.json({ success: true });

  response.cookies.set('makarim_session', token, {
    httpOnly:  true,
    sameSite:  'strict',
    maxAge:    60 * 60 * 24 * 7, // 7 Tage
    path:      '/',
    secure:    process.env.NODE_ENV === 'production',
  });

  return response;
}
