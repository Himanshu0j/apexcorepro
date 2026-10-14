import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Publicly safe order view
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        productName: order.productName,
        orderDescription: order.orderDescription,
        priceUsd: order.priceUsd,
        amountUsdt: order.amountUsdt,
        network: order.network,
        merchantAddress: order.merchantAddress,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        txHash: order.txHash,
        amountSent: order.amountSent,
        status: order.status,
        activationKey: order.status === 'KEY_ISSUED' ? order.activationKey : undefined,
        rejectionReason: order.status === 'PAYMENT_REJECTED' ? order.rejectionReason : undefined,
        verifiedAt: order.verifiedAt,
      },
    });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}
