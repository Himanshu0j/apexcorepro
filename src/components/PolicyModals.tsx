'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, FileText, Lock, HelpCircle, Mail, CheckCircle2 } from 'lucide-react';

export type PolicyType = 'terms' | 'privacy' | 'refund' | 'support' | null;

interface PolicyModalsProps {
  activePolicy: PolicyType;
  onClose: () => void;
  supportEmail?: string;
  companyName?: string;
}

export default function PolicyModals({
  activePolicy,
  onClose,
  supportEmail = 'support@apexcore-software.io',
  companyName = 'ApexCore Technologies Inc.',
}: PolicyModalsProps) {
  const [supportMessageSent, setSupportMessageSent] = useState(false);
  const [supportEmailInput, setSupportEmailInput] = useState('');
  const [supportMsgInput, setSupportMsgInput] = useState('');

  if (!activePolicy) return null;

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportMessageSent(true);
    setTimeout(() => {
      setSupportMessageSent(false);
      onClose();
    }, 2500);
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

        {/* Modal: Terms of Service */}
        {activePolicy === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <FileText className="h-5 w-5 text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Terms of Service</h2>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong className="text-slate-900">1. Software License Grant:</strong> Purchasing a Tool Activation Key grants the licensee a non-exclusive, perpetual single-user license to activate and utilize the designated software version.
              </p>
              <p>
                <strong className="text-slate-900">2. Cryptocurrency Settlement:</strong> Payments are collected in USDT via the TRON (TRC20) network at a fixed equivalent of 200.00 USDT. The customer is responsible for ensuring transfers are sent to the correct receiving address on the TRC20 network.
              </p>
              <p>
                <strong className="text-slate-900">3. Verification & Issuance:</strong> Submitting a transaction hash initiates ledger verification. Activation keys are delivered following on-chain confirmation of funds.
              </p>
              <p>
                <strong className="text-slate-900">4. Restrictions:</strong> Reselling, sublicensing, or distributing issued activation keys without authorization is strictly prohibited.
              </p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Operating entity: {companyName} • Contact: {supportEmail}
              </p>
            </div>
          </div>
        )}

        {/* Modal: Privacy Policy */}
        {activePolicy === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Lock className="h-5 w-5 text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Privacy Policy</h2>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong className="text-slate-900">1. Data Collected:</strong> We collect only the information necessary to process your transaction and deliver your software key: email address, optional contact name, and public transaction hash (TxID).
              </p>
              <p>
                <strong className="text-slate-900">2. Credentials Safety:</strong> We never request or store private keys, wallet seed phrases, recovery passwords, or exchange account access.
              </p>
              <p>
                <strong className="text-slate-900">3. Information Use:</strong> Contact details are used exclusively for order tracking, key delivery, and essential support correspondence. We do not sell customer information to third parties.
              </p>
            </div>
          </div>
        )}

        {/* Modal: Refund Policy */}
        {activePolicy === 'refund' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <ShieldAlert className="h-5 w-5 text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Refund & Cancellation Policy</h2>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="p-3 rounded-md border border-slate-200 bg-slate-50 text-slate-800 text-xs">
                <strong>Blockchain Finality:</strong> Transactions on the TRON network are final and immutable. Once broadcast, funds cannot be reversed or recalled by network participants.
              </div>

              <p>
                <strong className="text-slate-900">1. Incorrect Network Transfers:</strong> If funds are transmitted via an unsupported network (such as Ethereum ERC20, BSC BEP20, Polygon, or Solana), the transaction cannot be retrieved, and refunds cannot be issued.
              </p>
              <p>
                <strong className="text-slate-900">2. Underpayments & Overpayments:</strong> Underpaid transactions remain in verification until the full balance is settled. If you sent an overpayment in error, please contact support with your transaction hash to arrange a resolution.
              </p>
              <p>
                <strong className="text-slate-900">3. Technical Incompatibility:</strong> If our tool cannot run on your verified hardware due to an unresolved technical defect, refund requests may be evaluated within 7 days of key delivery by contacting {supportEmail}.
              </p>
            </div>
          </div>
        )}

        {/* Modal: Support / Help Center */}
        {activePolicy === 'support' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <HelpCircle className="h-5 w-5 text-slate-700" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">Help & Support</h2>
                <p className="text-xs text-slate-500">Submit an inquiry regarding payment verification or activation.</p>
              </div>
            </div>

            {supportMessageSent ? (
              <div className="p-5 rounded-md border border-emerald-200 bg-emerald-50 text-center space-y-1.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-900">Inquiry received</h4>
                <p className="text-xs text-slate-600">
                  Our support desk has received your message and will respond to your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
                <div className="p-2.5 rounded-md border border-slate-200 bg-slate-50 flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>
                    Direct email: <a href={`mailto:${supportEmail}`} className="font-mono text-slate-900 font-medium hover:underline">{supportEmail}</a>
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Your email address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={supportEmailInput}
                    onChange={(e) => setSupportEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Order reference ID or issue description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={supportMsgInput}
                    onChange={(e) => setSupportMsgInput(e.target.value)}
                    placeholder="Include your Order ID and describe your question or issue..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                  >
                    Send inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
