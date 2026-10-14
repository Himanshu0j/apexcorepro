import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { isValidTronAddress } from '@/lib/tron';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const updates = await req.json();

    // Validate TRON address if changed
    if (updates.merchantWalletAddress) {
      if (!isValidTronAddress(updates.merchantWalletAddress)) {
        return NextResponse.json(
          {
            error:
              'Invalid TRON wallet address format. It must be a valid 34-character TRON Base58 address starting with "T".',
          },
          { status: 400 }
        );
      }
    }

    if (updates.priceUsdt !== undefined) {
      const price = parseFloat(updates.priceUsdt);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ error: 'USDT price must be a positive number.' }, { status: 400 });
      }
      updates.priceUsdt = price;
      updates.priceUsd = price;
    }

    if (updates.supportEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.supportEmail.trim())) {
        return NextResponse.json({ error: 'Invalid support email format.' }, { status: 400 });
      }
    }

    const updated = updateSettings(updates);

    return NextResponse.json({
      success: true,
      message: 'Merchant settings successfully updated and published.',
      settings: updated,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
