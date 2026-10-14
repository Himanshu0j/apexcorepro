import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getAdminStats } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search')?.toLowerCase().trim();

    let orders = getAllOrders();

    if (statusFilter && statusFilter !== 'ALL') {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    if (searchQuery) {
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(searchQuery)) ||
          (o.customerName && o.customerName.toLowerCase().includes(searchQuery)) ||
          (o.txHash && o.txHash.toLowerCase().includes(searchQuery)) ||
          (o.activationKey && o.activationKey.toLowerCase().includes(searchQuery))
      );
    }

    const stats = getAdminStats();

    return NextResponse.json({
      success: true,
      orders,
      stats,
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}
