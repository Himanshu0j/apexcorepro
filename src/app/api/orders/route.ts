import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let customerEmail: string | undefined;
    let customerName: string | undefined;

    try {
      const body = await req.json();
      customerEmail = body.customerEmail;
      customerName = body.customerName;
    } catch {
      // Body is optional when initiating checkout
    }

    const order = createOrder(customerEmail, customerName);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        createdAt: order.createdAt,
        productName: order.productName,
        orderDescription: order.orderDescription,
        priceUsd: order.priceUsd,
        amountUsdt: order.amountUsdt,
        network: order.network,
        merchantAddress: order.merchantAddress,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
