'use client';

import React from 'react';
import { ShieldAlert, FileText, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { OrderStatus } from '@/types';

interface OrderSummaryCardProps {
  orderId: string;
  priceUsdt?: number;
  productName?: string;
  orderDescription?: string;
  status: OrderStatus;
  onRefreshOrder?: () => void;
  isRefreshing?: boolean;
}

export default function OrderSummaryCard({
  orderId,
  priceUsdt = 200,
  productName = 'Tool Activation Key',
  orderDescription = 'Software tool activation license.',
  status = 'AWAITING_PAYMENT',
  onRefreshOrder,
  isRefreshing,
}: OrderSummaryCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'KEY_ISSUED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Activation Key Issued
          </span>
        );
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Payment Confirmed
          </span>
        );
      case 'VERIFICATION_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            Verification Pending
          </span>
        );
      case 'PAYMENT_REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Payment Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/50 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-600/40">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            Awaiting Payment
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1424]/90 p-6 md:p-7 shadow-xl shadow-black/40 backdrop-blur-md">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-blue-400">
            Official Checkout
          </span>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Order Summary</h2>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onRefreshOrder && (
            <button
              type="button"
              onClick={onRefreshOrder}
              disabled={isRefreshing}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Refresh order status"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Order Reference Row */}
      <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-medium">Server Order Reference</span>
        <span className="font-mono text-sm font-bold text-blue-300 tracking-wider">
          {orderId || 'ORD-INITIALIZING...'}
        </span>
      </div>

      {/* Item Details */}
      <div className="mt-5 space-y-3.5 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <FileText className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">{productName}</p>
              <p className="text-xs text-slate-400">{orderDescription}</p>
            </div>
          </div>
          <span className="font-mono font-bold text-white shrink-0">${priceUsdt}.00</span>
        </div>

        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Accepted Payment Currency</span>
          <span className="font-semibold text-slate-200">USDT (Tether USD)</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Settlement Blockchain</span>
          <span className="font-semibold text-blue-400 font-mono">TRON (TRC20)</span>
        </div>

        {/* Pricing Clarity Notice */}
        <div className="border-t border-slate-800/80 pt-4 pb-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-300">Total Payable Amount</span>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-white">
                {priceUsdt}.00 <span className="text-sm font-normal text-blue-400">USDT</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Fixed 1:1 settlement (${priceUsdt}.00 USD = Exactly {priceUsdt}.00 USDT)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Compatibility Warning */}
      <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Required Network: TRON (TRC20)</p>
            <p className="text-slate-300 leading-relaxed">
              You must send USDT over the TRON TRC20 network only. Transactions sent via Ethereum (ERC20), BNB Chain (BEP20), Polygon, or Solana cannot be recovered and may result in lost funds.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
        * Submitting transaction details queues the order for blockchain verification. Payments are confirmed only after on-chain validation.
      </p>
    </div>
  );
}
