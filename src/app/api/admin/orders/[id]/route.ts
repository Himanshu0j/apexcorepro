import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, fulfillOrderKey, rejectOrder, getSettings } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { verifyTronTransaction } from '@/lib/tron';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { action, reason, customKey } = body;

    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const res = fulfillOrderKey(id, customKey);
      if (!res.success) {
        return NextResponse.json({ error: res.error || 'Failed to issue key.' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Order approved and activation key (${res.key}) issued successfully.`,
        order: getOrderById(id),
      });
    }

    if (action === 'REJECT') {
      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { error: 'A specific reason is required when rejecting a transaction.' },
          { status: 400 }
        );
      }
      const res = rejectOrder(id, reason.trim());
      if (!res.success) {
        return NextResponse.json({ error: res.error || 'Failed to reject order.' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Order status updated to REJECTED with specified reason.',
        order: getOrderById(id),
      });
    }

    if (action === 'VERIFY_BLOCKCHAIN') {
      if (!order.txHash) {
        return NextResponse.json({ error: 'Order does not have a transaction hash.' }, { status: 400 });
      }

      const settings = getSettings();
      const verification = await verifyTronTransaction(order.txHash, settings, order.amountUsdt);

      if (verification.verified) {
        // Automatically approve and issue key if verified!
        fulfillOrderKey(id);
      }

      return NextResponse.json({
        success: true,
        verification,
        order: getOrderById(id),
      });
    }

    return NextResponse.json({ error: 'Invalid administrative action.' }, { status: 400 });
  } catch (error) {
    console.error('Admin order action error:', error);
    return NextResponse.json({ error: 'Server error processing action.' }, { status: 500 });
  }
}
