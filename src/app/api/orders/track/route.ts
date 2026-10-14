import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'No order found matching this reference ID.' }, { status: 404 });
    }

    // If customerEmail is present on order, verify match
    if (order.customerEmail && email) {
      if (order.customerEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: 'Email address does not match this order reference.' },
          { status: 403 }
        );
      }
    }

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
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        txHash: order.txHash,
        amountSent: order.amountSent,
        status: order.status,
        activationKey: order.status === 'KEY_ISSUED' ? order.activationKey : undefined,
        rejectionReason: order.status === 'PAYMENT_REJECTED' ? order.rejectionReason : undefined,
        verifiedAt: order.verifiedAt,
        submittedAt: order.submittedAt,
        tronscanUrl: order.txHash ? `https://tronscan.org/#/transaction/${order.txHash}` : undefined,
      },
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ error: 'Failed to track order.' }, { status: 500 });
  }
}
