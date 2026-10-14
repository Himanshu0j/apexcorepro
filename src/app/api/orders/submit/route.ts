import { NextRequest, NextResponse } from 'next/server';
import {
  submitOrderTransaction,
  getOrderById,
  getSettings,
  fulfillOrderKey,
} from '@/lib/db';
import { isValidTxHash, normalizeTxHash, verifyTronTransaction } from '@/lib/tron';

export const dynamic = 'force-dynamic';

// In-memory rate limiting map for spam prevention (IP / timestamp)
const rateLimitMap = new Map<string, number[]>();
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  const recentTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recentTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(identifier, recentTimestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      customerEmail,
      customerName,
      txHash,
      amountSent,
      senderAddress,
      screenshotBase64,
      confirmedNetwork,
      agreedToTerms,
      notes,
    } = body;

    // 1. Validation: Required fields
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found. Please refresh and try again.' }, { status: 404 });
    }

    if (!customerEmail || typeof customerEmail !== 'string') {
      return NextResponse.json({ error: 'A valid customer email is required for key delivery.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json({ error: 'Transaction hash (TxID) is required.' }, { status: 400 });
    }

    const cleanTxHash = normalizeTxHash(txHash);
    if (!isValidTxHash(cleanTxHash)) {
      return NextResponse.json(
        {
          error:
            'Invalid TRON transaction hash. It must be exactly 64 hexadecimal characters. Please check your wallet transaction details.',
        },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amountSent);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Please specify a valid amount sent in USDT.' }, { status: 400 });
    }

    if (!confirmedNetwork) {
      return NextResponse.json(
        { error: 'You must confirm that you sent funds via TRON (TRC20) network.' },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'You must acknowledge the verification and privacy policies.' },
        { status: 400 }
      );
    }

    // 2. Validate screenshot payload size if provided
    let safeScreenshotUrl: string | undefined;
    if (screenshotBase64 && typeof screenshotBase64 === 'string') {
      // Limit to ~6MB base64 string
      if (screenshotBase64.length > 8 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Uploaded screenshot exceeds maximum allowed size (5MB). Please upload a smaller image.' },
          { status: 400 }
        );
      }
      if (!screenshotBase64.startsWith('data:image/')) {
        return NextResponse.json(
          { error: 'Uploaded file must be a valid image (PNG, JPG, WEBP).' },
          { status: 400 }
        );
      }
      safeScreenshotUrl = screenshotBase64;
    }

    // 3. Save submission details
    const submissionResult = submitOrderTransaction(orderId, {
      customerEmail: customerEmail.trim(),
      customerName: customerName ? customerName.trim() : undefined,
      txHash: cleanTxHash,
      amountSent: numericAmount,
      senderAddress: senderAddress ? senderAddress.trim() : undefined,
      screenshotUrl: safeScreenshotUrl,
      notes: notes ? notes.trim() : undefined,
    });

    if (!submissionResult.success || !submissionResult.order) {
      return NextResponse.json({ error: submissionResult.error || 'Failed to submit transaction.' }, { status: 400 });
    }

    const settings = getSettings();
    let currentOrder = submissionResult.order;
    let autoVerified = false;

    // 4. Genuine TRON Blockchain Verification Attempt
    if (settings.enableAutomaticTronGridCheck) {
      try {
        const verifyResult = await verifyTronTransaction(cleanTxHash, settings, order.amountUsdt);
        if (verifyResult.verified) {
          autoVerified = true;
          // Allocate key and update order
          fulfillOrderKey(order.id);
          const updated = getOrderById(order.id);
          if (updated) currentOrder = updated;
        }
      } catch (err) {
        console.error('TRON verification error during submission:', err);
      }
    }

    const responseMessage =
      'Your payment details have been submitted. Your transaction is awaiting verification. Your activation key will be issued after successful payment verification.';

    return NextResponse.json({
      success: true,
      message: responseMessage,
      order: {
        id: currentOrder.id,
        status: currentOrder.status,
        customerEmail: currentOrder.customerEmail,
        txHash: currentOrder.txHash,
        amountSent: currentOrder.amountSent,
        submittedAt: currentOrder.submittedAt,
        activationKey: currentOrder.status === 'KEY_ISSUED' ? currentOrder.activationKey : undefined,
      },
      autoVerified,
    });
  } catch (error) {
    console.error('Submit transaction endpoint error:', error);
    return NextResponse.json({ error: 'Server error processing transaction submission.' }, { status: 500 });
  }
}
