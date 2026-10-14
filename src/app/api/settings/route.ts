import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = getSettings();
    // Return only safe public settings
    return NextResponse.json({
      toolName: settings.toolName,
      productName: settings.productName,
      productDescription: settings.productDescription,
      priceUsd: settings.priceUsd,
      priceUsdt: settings.priceUsdt,
      merchantWalletAddress: settings.merchantWalletAddress,
      network: settings.network,
      usdtContractAddress: settings.usdtContractAddress,
      supportEmail: settings.supportEmail,
      companyName: settings.companyName,
      deliveryTimeframe: settings.deliveryTimeframe,
      manualReviewEstimatedMinutes: settings.manualReviewEstimatedMinutes,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}
