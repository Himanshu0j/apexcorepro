'use client';

import React from 'react';
import { ShoppingBag, Send, FileCheck2, KeyRound, Clock } from 'lucide-react';

interface PaymentInstructionsProps {
  priceUsdt?: number;
}

export default function PaymentInstructions({ priceUsdt = 200 }: PaymentInstructionsProps) {
  const steps = [
    {
      number: '01',
      title: 'Review Your Order',
      description: `Confirm your product (Tool Activation Key), the exact amount ($${priceUsdt} USDT), and that your wallet is operating on the TRON (TRC20) network.`,
      icon: ShoppingBag,
      tag: 'Order Details',
    },
    {
      number: '02',
      title: 'Send USDT (TRC20)',
      description: `Open your cryptocurrency wallet or exchange withdrawal screen. Select USDT on the TRON TRC20 network and transfer exactly ${priceUsdt} USDT to the displayed merchant address.`,
      icon: Send,
      tag: 'Blockchain Transfer',
    },
    {
      number: '03',
      title: 'Submit Transaction Hash',
      description:
        'Once sent, copy the 64-character transaction hash (TxID) from your wallet receipt and enter it into the verification form below along with your delivery email.',
      icon: FileCheck2,
      tag: 'Verification Queue',
    },
    {
      number: '04',
      title: 'Receive Your Activation Key',
      description:
        'Upon blockchain confirmation and multi-point audit, your unique software Tool Activation Key will be unlocked on your order tracking page and sent to your email.',
      icon: KeyRound,
      tag: 'Key Issuance',
    },
  ];

  return (
    <section id="instructions-section" className="py-12">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-blue-400">
            Payment Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Payment Instructions
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
            Follow this simple four-step process to complete your purchase and secure your activation key.
          </p>
        </div>

        {/* 4-Step Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-slate-800 bg-[#0d1424]/80 p-5 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-[#10182b]"
              >
                {/* Step number badge & tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-blue-500/40 transition-colors">
                    {step.number}
                  </span>
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                    {step.tag}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm sm:text-base leading-tight">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Realistic Timing & Verification Advisory Banner */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-white">Estimated Verification Time: </span>
              <span>
                TRON network confirmation typically takes 1–3 minutes. Manual review and key issuance usually complete within 15–45 minutes.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            No Automated False Promises
          </span>
        </div>
      </div>
    </section>
  );
}
