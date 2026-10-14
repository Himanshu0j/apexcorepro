'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Clock, KeyRound } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How and when will I receive my Tool Activation Key?',
    answer:
      'Once your TRON TRC20 transfer is confirmed on the blockchain and verified against your transaction hash (TxID), your activation key is automatically allocated and dispatched to your submitted email address. You can also monitor your order live and download your key directly from our Order Tracking portal.',
  },
  {
    question: 'Why is TRON (TRC20) the required payment network?',
    answer:
      'TRON TRC20 provides rapid block confirmations (typically under 3 minutes) with low and predictable network fees. Please verify that your wallet or exchange withdrawal network is explicitly set to TRC20 before sending funds. Transfers sent through unsupported networks (ERC20, BEP20, Polygon) cannot be detected by our TRON ledger scanner.',
  },
  {
    question: 'Where do I find my 64-character Transaction Hash (TxID)?',
    answer:
      'In exchanges (such as Binance, OKX, Bybit, or Kraken), navigate to your Wallet -> Withdrawal History -> USDT Withdrawal Details and copy the 64-character alphanumeric TxID. In mobile or browser wallets (such as TronLink or Trust Wallet), tap on the sent transaction and select "Copy Transaction Hash".',
  },
  {
    question: 'What should I do if my payment amount was slightly different due to fees?',
    answer:
      'Most cryptocurrency exchanges deduct a withdrawal fee (typically 1–2.5 USDT) from the sent total. Please ensure your withdrawal total is adjusted so that the exact net amount of 200.00 USDT arrives at the merchant address. If an underpayment occurs, contact support@apexcore-software.io with your Order Reference ID.',
  },
  {
    question: 'Can I look up my activation key later if I close this browser window?',
    answer:
      'Yes. Keep note of your unique Order Reference ID (e.g. ORD-2026-XXXXX). You can return to this website at any time, click "Track order" in the top navigation bar, and retrieve your key and download your activation certificate.',
  },
];

export default function CheckoutFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="mt-12 rounded-lg border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Payment & Activation Assistance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent instructions to ensure smooth transaction settlement and prompt key issuance.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-md border border-slate-200/60 self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Legitimate software license fulfillment</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 mt-2">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-4">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between text-left gap-4 group"
              >
                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-slate-900' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2.5 text-xs text-slate-600 leading-relaxed pr-6 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Reassurance Footer */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Average verification & delivery time: <strong>15–45 minutes</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Need direct help? Contact <a href="mailto:support@apexcore-software.io" className="text-slate-900 font-medium underline">support@apexcore-software.io</a></span>
        </div>
      </div>
    </section>
  );
}
