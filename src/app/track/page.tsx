'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  KeyRound,
  Copy,
  Check,
  Download,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { Order } from '@/types';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      performLookup(initialOrderId, '');
    }
  }, [initialOrderId]);

  const performLookup = async (id: string, email: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: id.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'No matching order found.');
        setTrackedOrder(null);
      } else {
        setTrackedOrder(data.order);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lookup failed.';
      setErrorMessage(msg);
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderIdInput, emailInput);
  };

  const copyActivationKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const downloadLicenseFile = (order: Order) => {
    if (!order.activationKey) return;
    const content = `=====================================================
APEXCORE PRO - OFFICIAL SOFTWARE ACTIVATION KEY
=====================================================
Order Reference : ${order.id}
Product         : ${order.productName}
Issued Date     : ${order.verifiedAt || new Date().toISOString()}
Licensed To     : ${order.customerEmail || 'Registered User'}
Payment Network : TRON (TRC20)
Amount Paid     : ${order.amountSent || order.amountUsdt || 200} USDT
Transaction ID  : ${order.txHash || 'N/A'}

ACTIVATION KEY  : ${order.activationKey}

-----------------------------------------------------
ACTIVATION INSTRUCTIONS:
1. Open your software application.
2. Navigate to Help -> License & Activation.
3. Paste the activation key above.
4. Click 'Activate License'.
-----------------------------------------------------
Support Contact : support@apexcore-software.io
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ActivationKey_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to checkout</span>
          </Link>

          <span className="text-xs font-semibold text-slate-800">
            Order Status Portal
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Track order &amp; activation key
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Enter your order reference ID to check payment verification status and access your software license key.
          </p>
        </div>

        {/* Lookup Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <form onSubmit={handleTrackSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Order reference ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="ORD-2026-XXXXX"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Customer email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Find order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tracked Order Details */}
        {trackedOrder && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Order reference</span>
                <p className="font-mono text-base font-bold text-slate-900">{trackedOrder.id}</p>
              </div>

              <div>
                {trackedOrder.status === 'KEY_ISSUED' && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Activation key issued
                  </span>
                )}
                {trackedOrder.status === 'VERIFICATION_PENDING' && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    Verification in progress
                  </span>
                )}
                {trackedOrder.status === 'PAYMENT_CONFIRMED' && (
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                    Payment confirmed
                  </span>
                )}
                {trackedOrder.status === 'PAYMENT_REJECTED' && (
                  <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                    Payment rejected
                  </span>
                )}
                {trackedOrder.status === 'AWAITING_PAYMENT' && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                    Awaiting payment
                  </span>
                )}
              </div>
            </div>

            {/* Issued Key Box */}
            {trackedOrder.activationKey && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-emerald-700" />
                    <span>Your Tool Activation Key</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    Valid License
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-white border border-emerald-300">
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tracking-wider break-all select-all">
                    {trackedOrder.activationKey}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyActivationKey(trackedOrder.activationKey!)}
                    className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 transition-colors shrink-0"
                  >
                    {keyCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>Activate inside software via <strong>Help &gt; Activate License</strong>.</span>
                  <button
                    type="button"
                    onClick={() => downloadLicenseFile(trackedOrder)}
                    className="inline-flex items-center gap-1 text-slate-900 font-medium hover:underline text-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-600" />
                    <span>Download file (.txt)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rejection notice */}
            {trackedOrder.status === 'PAYMENT_REJECTED' && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 space-y-1">
                <p className="font-semibold">Review note:</p>
                <p>{trackedOrder.rejectionReason || 'Transaction did not meet verification criteria.'}</p>
                <p className="text-slate-500 text-[11px] pt-1">
                  For support inquiries, contact{' '}
                  <a href="mailto:support@apexcore-software.io" className="text-slate-900 font-medium underline">
                    support@apexcore-software.io
                  </a>{' '}
                  with reference {trackedOrder.id}.
                </p>
              </div>
            )}

            {/* Summary Details */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Product:</span>
                <span className="font-sans font-medium text-slate-900">{trackedOrder.productName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="text-slate-900">${trackedOrder.amountUsdt}.00 USDT (TRON TRC20)</span>
              </div>
              {trackedOrder.customerEmail && (
                <div className="flex justify-between text-slate-600">
                  <span>Email:</span>
                  <span className="text-slate-900">{trackedOrder.customerEmail}</span>
                </div>
              )}
              {trackedOrder.txHash && (
                <div className="pt-1 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between gap-1 text-slate-600">
                  <span>Transaction hash:</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                      {trackedOrder.txHash}
                    </span>
                    <a
                      href={`https://tronscan.org/#/transaction/${trackedOrder.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 shrink-0"
                      title="Inspect on TronScan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">Loading Order Portal...</div>}>
      <TrackContent />
    </Suspense>
  );
}
