import { NextRequest } from 'next/server';

async function computeToken(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Returns true if the request has a valid admin session cookie OR a valid API key. */
export async function isAuthorized(req: NextRequest): Promise<boolean> {
  const key = req.headers.get('x-api-key');
  if (key && process.env.CMS_API_KEY && key === process.env.CMS_API_KEY) return true;

  const session = req.cookies.get('makarim_session')?.value ?? '';
  const expected = await computeToken(
    process.env.ADMIN_PASSWORD ?? 'makarim2024',
    process.env.ADMIN_SALT     ?? 'makarim-cms-salt-2024',
  );
  return !!session && session === expected;
}
