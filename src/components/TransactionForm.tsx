'use client';

import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileImage,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { isValidTxHash, normalizeTxHash } from '@/lib/tron';
import { Order } from '@/types';

interface TransactionFormProps {
  orderId: string;
  expectedAmount?: number;
  onSubmissionSuccess: (order: Order) => void;
  onOpenTracker: () => void;
}

export default function TransactionForm({
  orderId,
  expectedAmount = 200,
  onSubmissionSuccess,
  onOpenTracker,
}: TransactionFormProps) {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [txHash, setTxHash] = useState('');
  const [amountSent, setAmountSent] = useState(expectedAmount.toString());
  const [senderAddress, setSenderAddress] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [confirmedNetwork, setConfirmedNetwork] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<{
    message: string;
    order: Order;
    autoVerified?: boolean;
  } | null>(null);

  // Real-time TxID validation helper
  const cleanTx = normalizeTxHash(txHash);
  const isTxFormatValid = txHash.trim().length === 0 || isValidTxHash(cleanTx);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Uploaded screenshot must be an image (JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Screenshot exceeds 5MB limit. Please upload a smaller image file.');
      return;
    }

    setErrorMessage(null);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setScreenshotBase64(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotBase64(null);
    setScreenshotFileName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form field checks
    if (!customerEmail.trim()) {
      setErrorMessage('Customer email is required for license key delivery.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!txHash.trim()) {
      setErrorMessage('Transaction hash (TxID) is required.');
      return;
    }

    if (!isValidTxHash(cleanTx)) {
      setErrorMessage(
        'Transaction hash must be exactly 64 hexadecimal characters. Please copy the complete TxID from your wallet transfer details.'
      );
      return;
    }

    const numAmount = parseFloat(amountSent);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid sent amount.');
      return;
    }

    if (!confirmedNetwork) {
      setErrorMessage('You must confirm that you sent funds via TRON TRC20 network.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('You must agree to the verification and privacy notice.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || undefined,
          txHash: cleanTx,
          amountSent: numAmount,
          senderAddress: senderAddress.trim() || undefined,
          screenshotBase64: screenshotBase64 || undefined,
          confirmedNetwork,
          agreedToTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to submit payment details. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSuccessResponse({
        message: data.message,
        order: data.order,
        autoVerified: data.autoVerified,
      });
      onSubmissionSuccess(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A network error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResponse) {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-[#0d1424] p-6 md:p-8 shadow-xl shadow-blue-500/5 backdrop-blur-md">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="h-7 w-7 text-blue-400" />
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Transaction Details Submitted
          </h3>

          {/* Required honest notice */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed text-left">
            <p className="font-medium text-blue-300 mb-1">Status Notice:</p>
            <p>{successResponse.message}</p>
          </div>

          <div className="w-full rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Order Reference:</span>
              <span className="font-mono font-bold text-white">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Delivery Email:</span>
              <span className="font-semibold text-slate-200">{customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction Hash:</span>
              <span className="font-mono text-slate-300 truncate max-w-[240px] sm:max-w-[320px]">
                {cleanTx}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Please retain your Order Reference. You can check the verification progress and access your activation key at any time.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              type="button"
              onClick={onOpenTracker}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Track Order Progress</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="verification-section"
      className="rounded-2xl border border-slate-800 bg-[#0d1424]/90 p-6 md:p-8 shadow-xl shadow-black/40 backdrop-blur-md"
    >
      {/* Form Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-mono font-medium tracking-wide uppercase text-blue-400">
          Payment Proof
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
          Submit Transaction Verification
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          After completing your TRON TRC20 transfer, enter your transaction hash below. Our verification queue will audit the ledger before issuing your key.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order ID (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Order Reference ID
            </label>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 font-mono text-sm text-blue-300">
              <Lock className="h-3.5 w-3.5 text-slate-500 mr-2" />
              <span>{orderId}</span>
              <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-wider">
                Prefilled
              </span>
            </div>
          </div>

          {/* Network Selection (Fixed TRC20) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Settlement Network
            </label>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200">
              <span className="font-semibold text-blue-400">TRON — TRC20</span>
              <span className="text-[10px] font-mono rounded bg-blue-500/10 px-2 py-0.5 text-blue-300 border border-blue-500/20">
                Fixed Gateway
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Delivery Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              id="customerEmail"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. yourname@domain.com"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Your official Tool Activation Key will be dispatched here.
            </p>
          </div>

          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name or Organization <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alex Morgan / CyberCorp"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Amount & Sender Wallet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Sent */}
          <div>
            <label htmlFor="amountSent" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Amount Sent (USDT) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="amountSent"
                type="number"
                step="any"
                required
                value={amountSent}
                onChange={(e) => setAmountSent(e.target.value)}
                placeholder="200"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-blue-400">
                USDT
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Must be exactly ${expectedAmount} USDT (excluding wallet network fees).
            </p>
          </div>

          {/* Sender Wallet Address */}
          <div>
            <label htmlFor="senderAddress" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sender Wallet Address <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              id="senderAddress"
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="e.g. T..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 font-mono text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Assists faster manual cross-referencing on high-traffic days.
            </p>
          </div>
        </div>

        {/* Transaction Hash */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="txHash" className="block text-xs font-semibold text-slate-300">
              Transaction Hash (TxID) <span className="text-rose-400">*</span>
            </label>
            {cleanTx.length > 0 && (
              <span
                className={`text-[11px] font-mono ${
                  isValidTxHash(cleanTx) ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {cleanTx.length}/64 characters {isValidTxHash(cleanTx) ? '✓ Valid Format' : ''}
              </span>
            )}
          </div>
          <input
            id="txHash"
            type="text"
            required
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste 64-character TRON transaction hash (e.g. a1f8c92e...)"
            className={`w-full rounded-xl border bg-slate-900/80 px-3.5 py-2.5 font-mono text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
              !isTxFormatValid
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Found on your wallet or exchange transfer receipt under &quot;Transaction Hash&quot; or &quot;TxID&quot;.
          </p>
        </div>

        {/* Optional Screenshot Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Transaction Screenshot / Receipt <span className="text-slate-500">(Optional)</span>
          </label>

          {!screenshotBase64 ? (
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4 text-center cursor-pointer hover:border-slate-500 hover:bg-slate-900/50 transition-all">
              <Upload className="h-5 w-5 text-slate-400 mb-1.5" />
              <span className="text-xs font-medium text-slate-200">
                Click to browse or drag & drop transfer receipt
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, or WEBP up to 5MB
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <div className="flex items-center gap-2.5 truncate">
                <FileImage className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-xs font-mono text-slate-200 truncate">
                  {screenshotFileName || 'receipt_screenshot.png'}
                </span>
              </div>
              <button
                type="button"
                onClick={removeScreenshot}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Required Verification Checkboxes */}
        <div className="space-y-3 pt-2">
          {/* Checkbox 1: Network confirmation */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmedNetwork}
              onChange={(e) => setConfirmedNetwork(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-300 leading-snug">
              I confirm that I transferred exactly <strong className="text-white">${expectedAmount} USDT</strong> via the <strong className="text-blue-300">TRON (TRC20)</strong> network to the specified merchant recipient address.
            </span>
          </label>

          {/* Checkbox 2: Consent and review acknowledgement */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-300 leading-snug">
              I understand that submitting this form queues my transaction for blockchain audit. Activation keys are delivered only upon confirmed receipt of funds.
            </span>
          </label>
        </div>

        {/* Privacy & Anti-Phishing Notice */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Security Notice:</strong> We never store or request wallet private keys, passphrases, seed words, or exchange passwords. Only public blockchain transaction identifiers are collected.
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting for Verification...</span>
              </>
            ) : (
              <>
                <span>Submit Payment for Verification</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
