'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, RefreshCw, CheckCircle2 } from 'lucide-react';
import { OrderStatus } from '@/types';

interface CheckoutSummaryProps {
  orderId: string;
  priceUsdt?: number;
  productName?: string;
  orderDescription?: string;
  walletAddress: string;
  status: OrderStatus;
  onRefreshOrder?: () => void;
  isRefreshing?: boolean;
}

export default function CheckoutSummary({
  orderId,
  priceUsdt = 200,
  productName = 'Tool Activation Key',
  orderDescription = 'Software tool activation license.',
  walletAddress,
  status = 'AWAITING_PAYMENT',
  onRefreshOrder,
  isRefreshing,
}: CheckoutSummaryProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);

  const copyToClipboard = async (text: string, type: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'address') {
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      } else {
        setAmountCopied(true);
        setTimeout(() => setAmountCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'KEY_ISSUED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            Activation key issued
          </span>
        );
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
            Payment confirmed
          </span>
        );
      case 'VERIFICATION_PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            Verification pending
          </span>
        );
      case 'PAYMENT_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
            Payment rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
            Awaiting payment
          </span>
        );
    }
  };

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Summary Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            Order Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Reference: <span className="font-mono text-slate-700 font-semibold">{orderId || 'ORD-...'}</span></p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onRefreshOrder && (
            <button
              type="button"
              onClick={onRefreshOrder}
              disabled={isRefreshing}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="py-4 space-y-3 text-xs border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900 text-sm">{productName}</p>
            <p className="text-slate-500 mt-0.5">{orderDescription}</p>
          </div>
          <span className="font-mono font-semibold text-slate-900 text-sm whitespace-nowrap">
            ${priceUsdt}.00 USD
          </span>
        </div>

        <div className="flex justify-between text-slate-600 pt-1">
          <span>Settlement currency</span>
          <span className="font-medium text-slate-900">USDT</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Required network</span>
          <span className="font-mono font-medium text-slate-900">TRON (TRC20)</span>
        </div>

        {/* License Inclusions List */}
        <div className="pt-2.5 pb-1 space-y-1.5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Official digital software activation key</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Single workstation / user license grant</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Key dispatched via email &amp; Order Tracker</span>
          </div>
        </div>
      </div>

      {/* Amount Due Callout */}
      <div className="py-4 border-b border-slate-200 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-medium text-slate-600">Exact amount due</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Fixed 1:1 USD to USDT conversion</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold font-mono text-slate-900">
            {priceUsdt}.00 <span className="text-xs font-normal text-slate-500">USDT</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(priceUsdt.toString(), 'amount')}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline mt-0.5"
          >
            {amountCopied ? 'Amount copied' : 'Copy amount'}
          </button>
        </div>
      </div>

      {/* Receiving Wallet Section */}
      <div className="pt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-900">
              Receiving address (TRON TRC20)
            </span>
          </div>

          {/* Full address, cleanly wrapped, select-all */}
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 break-all select-all font-medium">
            {walletAddress}
          </div>

          {/* Copy Button */}
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => copyToClipboard(walletAddress, 'address')}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              {addressCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Address copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy address</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Starts {walletAddress.slice(0, 4)}... ends {walletAddress.slice(-4)}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-md border border-slate-200 bg-slate-50/60">
          <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
            <QRCodeSVG
              value={walletAddress}
              size={150}
              level="M"
              includeMargin={false}
              className="w-36 h-36"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 text-center flex items-center gap-1">
            <QrCode className="h-3 w-3 text-slate-400" />
            <span>Encodes the receiving TRON address</span>
          </p>
        </div>

        {/* Notice on network fee */}
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
          <p className="font-medium text-slate-900">Network fee reminder</p>
          <p>
            Please ensure your sending wallet or exchange covers the TRON network fee (typically 13–28 TRX or the exchange withdrawal fee) so that exactly {priceUsdt}.00 USDT arrives.
          </p>
        </div>
      </div>
    </aside>
  );
}
