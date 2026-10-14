import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  ADMIN_SECRET_SESSION_TOKEN,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authenticated = isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }

    setAdminSession();
    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully.',
      token: ADMIN_SECRET_SESSION_TOKEN,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Server authentication error.' }, { status: 500 });
  }
}

export async function DELETE() {
  clearAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out.' });
}
