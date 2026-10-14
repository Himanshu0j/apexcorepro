'use client';

import { Mail, CheckCircle2 } from 'lucide-react';
import { PolicyType } from './PolicyModals';

interface FooterProps {
  toolName?: string;
  supportEmail?: string;
  companyName?: string;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenTracker?: () => void;
}

export default function Footer({
  toolName = 'ApexCore Pro',
  supportEmail = 'support@apexcore-software.io',
  companyName = 'ApexCore Technologies Inc.',
  onOpenPolicy,
  onOpenTracker,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white pt-10 pb-12 text-xs text-slate-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Identity */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">{toolName}</span>
              <span className="text-[11px] text-slate-400 font-mono">v2.4</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Official software activation and license fulfillment portal. Direct cryptocurrency settlement over TRON TRC20.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-slate-600">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Contact: </span>
              <a href={`mailto:${supportEmail}`} className="text-slate-900 font-mono hover:underline">
                {supportEmail}
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                Policies
              </span>
              <ul className="space-y-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenPolicy('terms')}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenPolicy('privacy')}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenPolicy('refund')}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Refund Policy
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                Assistance & Delivery
              </span>
              <ul className="space-y-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenPolicy('support')}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Help & Contact Desk
                  </button>
                </li>
                {onOpenTracker && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenTracker}
                      className="hover:text-slate-900 transition-colors text-left"
                    >
                      Track Order & Key
                    </button>
                  </li>
                )}
                <li className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Manual ledger review</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Honest Disclaimer */}
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">Payment disclaimer: </span>
          Payments are processed through the cryptocurrency network specified at checkout (TRON TRC20). Blockchain transactions are final and irreversible. Please verify the destination address, network, and amount before broadcasting funds. Activation keys are delivered following on-chain confirmation.
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <p>© {currentYear} {companyName}. All rights reserved.</p>
          <p className="font-mono text-[10px]">Settlement: TRON TRC20 • Token: Tether USD (USDT)</p>
        </div>
      </div>
    </footer>
  );
}
