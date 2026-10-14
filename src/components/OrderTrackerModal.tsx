'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  KeyRound,
  Copy,
  Check,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Order } from '@/types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export default function OrderTrackerModal({
  isOpen,
  onClose,
  initialOrderId = '',
}: OrderTrackerModalProps) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTrackedOrder(null);

    if (!orderIdInput.trim()) {
      setErrorMessage('Please enter an Order Reference ID.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderIdInput.trim(),
          email: emailInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Order not found. Please verify the ID.');
        setIsLoading(false);
        return;
      }

      setTrackedOrder(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query order tracking.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Search className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">Track Order & Activation Key</h2>
            <p className="text-xs text-slate-500">
              Check verification status or retrieve your software activation key.
            </p>
          </div>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleTrack} className="mt-4 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Order reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="ORD-2026-XXXXX"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
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
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  <span>Check status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Details Display */}
        {trackedOrder && (
          <div className="mt-5 space-y-4 animate-in fade-in duration-200">
            {/* Status Card Header */}
            <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Order</span>
                  <p className="font-mono text-sm font-bold text-slate-900">{trackedOrder.id}</p>
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

              {/* Status explanation */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                {trackedOrder.status === 'KEY_ISSUED' && (
                  <p className="text-emerald-800">
                    Your payment was verified on the TRON blockchain. Your software activation key is ready below.
                  </p>
                )}
                {trackedOrder.status === 'VERIFICATION_PENDING' && (
                  <p className="text-amber-800">
                    Your transaction details have been received and are currently queued for blockchain verification. Reviews typically complete within 15–45 minutes.
                  </p>
                )}
                {trackedOrder.status === 'PAYMENT_REJECTED' && (
                  <div className="text-rose-800 space-y-1">
                    <p className="font-semibold">Review note:</p>
                    <p>{trackedOrder.rejectionReason || 'Transaction did not meet verification criteria.'}</p>
                    <p className="text-slate-500 text-[11px] pt-1">
                      Please contact support with your Order ID for assistance.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Issued Activation Key Section (if ready) */}
            {trackedOrder.activationKey && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-emerald-700" />
                    <span>Official Tool Activation Key</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    Valid License
                  </span>
                </div>

                {/* Key box */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-white border border-emerald-300">
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-wider break-all select-all">
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

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>Enter in tool via <strong>Help &gt; Activate License</strong>.</span>
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

            {/* Summary Details */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Product:</span>
                <span className="font-sans font-medium text-slate-900">{trackedOrder.productName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="text-slate-900">${trackedOrder.amountUsdt}.00 USDT</span>
              </div>
              {trackedOrder.txHash && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-1 border-t border-slate-200 text-slate-600">
                  <span>Transaction hash:</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">{trackedOrder.txHash}</span>
                    <a
                      href={`https://tronscan.org/#/transaction/${trackedOrder.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 shrink-0"
                      title="View on TronScan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
