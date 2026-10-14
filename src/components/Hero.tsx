'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, ShieldCheck, KeyRound, Search } from 'lucide-react';

interface HeroProps {
  onOpenTracker: () => void;
  priceUsdt?: number;
}

export default function Hero({ onOpenTracker, priceUsdt = 200 }: HeroProps) {
  const scrollToPayment = () => {
    const el = document.getElementById('payment-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[250px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-sm mb-6">
          <KeyRound className="h-3.5 w-3.5 text-blue-400" />
          <span>Want to Get Your Tool Activation Key?</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Activate Your Tool.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Get Started Today.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
          Complete your secure payment of ${priceUsdt} USDT and submit your transaction details to receive your official Tool Activation Key. Follow the payment instructions below and submit your transaction hash for verification.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollToPayment}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span>Continue to Payment</span>
            <ArrowDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenTracker}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-6 py-3.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-600"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span>Track Existing Order</span>
          </button>
        </div>

        {/* Three Honest Benefits */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Benefit 1 */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">One-Time Activation Payment</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Single fixed payment of ${priceUsdt} USDT. No recurring subscription charges or hidden monthly fees.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Manual Transaction Verification</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every submitted transaction hash is cross-referenced against the official TRON blockchain for authenticity.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <KeyRound className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Activation Key Delivery</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delivered immediately to your verified email address and unlocked in the order tracking portal once verified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
