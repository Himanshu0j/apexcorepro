'use client';

import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface CheckoutInstructionsProps {
  priceUsdt?: number;
}

export default function CheckoutInstructions({ priceUsdt = 200 }: CheckoutInstructionsProps) {
  return (
    <div className="space-y-4">
      {/* Step workflow */}
      <div>
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
          4-Step Payment Workflow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md border border-slate-200/80 bg-slate-50/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold">1</span>
              <strong className="text-slate-900 font-semibold">Verify Order Details</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-7">
              Required amount is <span className="font-mono font-semibold text-slate-900">${priceUsdt}.00 USDT</span> on <span className="font-mono font-semibold text-slate-900">TRON TRC20</span>.
            </p>
          </div>

          <div className="p-3 rounded-md border border-slate-200/80 bg-slate-50/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold">2</span>
              <strong className="text-slate-900 font-semibold">Send Funds</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-7">
              Transfer USDT to the merchant address shown on the right via any wallet or exchange.
            </p>
          </div>

          <div className="p-3 rounded-md border border-slate-200/80 bg-slate-50/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold">3</span>
              <strong className="text-slate-900 font-semibold">Copy 64-hex TxID</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-7">
              Copy the 64-character transaction hash from your wallet transfer receipt or withdrawal log.
            </p>
          </div>

          <div className="p-3 rounded-md border border-slate-200/80 bg-slate-50/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold">4</span>
              <strong className="text-slate-900 font-semibold">Submit & Receive Key</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed pl-7">
              Paste your TxID below with your delivery email for automated ledger reconciliation.
            </p>
          </div>
        </div>
      </div>

      {/* Network Compatibility Callout */}
      <div className="rounded-md border border-amber-300 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">Network Compatibility Notice</p>
          <p className="leading-relaxed">
            Send USDT using the <strong>TRON TRC20</strong> network only. Transfers sent via Ethereum (ERC20), BNB Chain (BEP20), Polygon, or other networks cannot be processed or refunded due to blockchain irreversibility.
          </p>
        </div>
      </div>

      {/* Verification Timeline Notice */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>
          Verification timeframe: TRON network block confirmation typically takes 1–3 minutes. Multi-point ledger audit and key dispatch usually complete within 15–45 minutes.
        </span>
      </div>
    </div>
  );
}
