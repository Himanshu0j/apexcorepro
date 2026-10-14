import { NextRequest, NextResponse } from 'next/server';
import { getKeysPool, addKeysToPool } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const keys = getKeysPool();
    const available = keys.filter((k) => k.status === 'AVAILABLE').length;
    const issued = keys.filter((k) => k.status === 'ISSUED').length;

    return NextResponse.json({
      success: true,
      keys,
      availableCount: available,
      issuedCount: issued,
    });
  } catch (error) {
    console.error('Fetch keys error:', error);
    return NextResponse.json({ error: 'Failed to retrieve keys.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { keys } = await req.json();

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'Please provide an array of key strings.' }, { status: 400 });
    }

    const { countAdded } = addKeysToPool(keys);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${countAdded} new activation keys to inventory pool.`,
      countAdded,
    });
  } catch (error) {
    console.error('Add keys error:', error);
    return NextResponse.json({ error: 'Failed to add keys.' }, { status: 500 });
  }
}
