'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Search, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  toolName?: string;
  onOpenTracker: () => void;
  onOpenSupport: () => void;
}

export default function Navbar({
  toolName = 'ApexCore Pro',
  onOpenTracker,
  onOpenSupport,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white font-mono text-xs font-bold tracking-tight shadow-sm transition-transform group-hover:scale-105">
              {toolName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-slate-900 text-sm sm:text-base">
                {toolName}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/60">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Verified Checkout</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            type="button"
            onClick={onOpenSupport}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Support</span>
          </button>

          <button
            type="button"
            onClick={onOpenTracker}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all active:scale-[0.98]"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Track order</span>
          </button>
        </div>
      </div>
    </header>
  );
}
