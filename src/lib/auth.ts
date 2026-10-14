import { cookies, headers } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'apex_admin_auth_token';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';
export const ADMIN_SECRET_SESSION_TOKEN = 'token_sess_apex_admin_9824_authenticated';

export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword) return false;
  return inputPassword.trim() === DEFAULT_ADMIN_PASSWORD.trim();
}

export function setAdminSession(): void {
  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_SECRET_SESSION_TOKEN, {
    httpOnly: true,
    secure: false, // Allows testing on localhost HTTP
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearAdminSession(): void {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export function isAdminAuthenticated(): boolean {
  try {
    // 1. Check cookies
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token === ADMIN_SECRET_SESSION_TOKEN) {
      return true;
    }

    // 2. Check Authorization or x-admin-token headers (for API / script testing)
    const headerStore = headers();
    const authHeader = headerStore.get('authorization');
    if (authHeader && authHeader.trim() === `Bearer ${ADMIN_SECRET_SESSION_TOKEN}`) {
      return true;
    }

    const customToken = headerStore.get('x-admin-token');
    if (customToken && customToken.trim() === ADMIN_SECRET_SESSION_TOKEN) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
