'use client';

import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileImage,
  X,
  Search,
} from 'lucide-react';
import { isValidTxHash, normalizeTxHash } from '@/lib/tron';
import { Order } from '@/types';

interface CheckoutFormProps {
  orderId: string;
  expectedAmount?: number;
  onSubmissionSuccess: (order: Order) => void;
  onOpenTracker: () => void;
}

export default function CheckoutForm({
  orderId,
  expectedAmount = 200,
  onSubmissionSuccess,
  onOpenTracker,
}: CheckoutFormProps) {
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

  const handlePasteTx = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTxHash(text.trim());
      }
    } catch {
      // clipboard access denied or unavailable
    }
  };

  const cleanTx = normalizeTxHash(txHash);
  const isTxFormatValid = txHash.trim().length === 0 || isValidTxHash(cleanTx);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Uploaded receipt must be an image (JPEG, PNG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Receipt image exceeds 5MB size limit.');
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

    if (!customerEmail.trim()) {
      setErrorMessage('Customer email is required for activation key delivery.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!txHash.trim()) {
      setErrorMessage('Transaction hash (TxID) is required.');
      return;
    }

    if (!isValidTxHash(cleanTx)) {
      setErrorMessage(
        'Transaction hash must be exactly 64 hexadecimal characters. Please copy the complete TxID from your wallet receipt.'
      );
      return;
    }

    const numAmount = parseFloat(amountSent);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount sent in USDT.');
      return;
    }

    if (!confirmedNetwork) {
      setErrorMessage('You must confirm that you sent funds via TRON TRC20 network.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('You must acknowledge the verification and privacy notice.');
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
      <div className="rounded-lg border border-slate-300 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-800 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Transaction details submitted
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {successResponse.message}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Order reference:</span>
            <span className="font-bold text-slate-900">{orderId}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery email:</span>
            <span className="text-slate-900">{customerEmail}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Transaction hash:</span>
            <span className="text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">{cleanTx}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Status:</span>
            <span className="text-amber-700 font-semibold font-sans">Verification pending</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Keep your Order Reference handy. Once the transaction is confirmed on the TRON network and verified, your activation key will be delivered to your email and accessible via the order tracker.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenTracker}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>Track order status</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
          Submit Transaction Details
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide your transfer information below to initiate payment verification.
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Order Reference and Network info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Order reference
            </label>
            <input
              type="text"
              readOnly
              value={orderId}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Network
            </label>
            <input
              type="text"
              readOnly
              value="TRON (TRC20)"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Email and Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="customerEmail" className="block text-xs font-medium text-slate-700 mb-1">
              Email address <span className="text-rose-500">*</span>
            </label>
            <input
              id="customerEmail"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <p className="mt-1 text-[11px] text-slate-500">Your activation key will be sent here.</p>
          </div>

          <div>
            <label htmlFor="customerName" className="block text-xs font-medium text-slate-700 mb-1">
              Name or organization <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alex Miller"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Amount sent & Sender wallet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="amountSent" className="block text-xs font-medium text-slate-700 mb-1">
              Amount sent (USDT) <span className="text-rose-500">*</span>
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
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">
                USDT
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="senderAddress" className="block text-xs font-medium text-slate-700 mb-1">
              Sender wallet address <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="senderAddress"
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="e.g. T..."
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Transaction Hash */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="txHash" className="block text-xs font-medium text-slate-700">
              Transaction hash (TxID) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteTx}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline transition-colors"
                title="Paste from clipboard"
              >
                Paste
              </button>
              {cleanTx.length > 0 && (
                <span
                  className={`text-[11px] font-mono ${
                    isValidTxHash(cleanTx) ? 'text-emerald-700 font-medium' : 'text-amber-700'
                  }`}
                >
                  {cleanTx.length}/64 characters {isValidTxHash(cleanTx) ? '✓ Valid format' : ''}
                </span>
              )}
            </div>
          </div>
          <input
            id="txHash"
            type="text"
            required
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste 64-character TRON transaction hash"
            className={`w-full rounded-md border bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${
              !isTxFormatValid
                ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
            }`}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Available on your wallet transaction receipt or exchange withdrawal record.
          </p>
        </div>

        {/* Optional Screenshot */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Transaction screenshot <span className="text-slate-400 font-normal">(optional)</span>
          </label>

          {!screenshotBase64 ? (
            <label className="flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-100/60 transition-colors">
              <Upload className="h-4 w-4 text-slate-500 mr-2" />
              <span className="text-xs text-slate-600">
                Click to attach screenshot (PNG, JPG, up to 5MB)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2.5">
              <div className="flex items-center gap-2 truncate text-xs text-slate-700 font-mono">
                <FileImage className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="truncate">{screenshotFileName || 'receipt_screenshot.png'}</span>
              </div>
              <button
                type="button"
                onClick={removeScreenshot}
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                title="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmedNetwork}
              onChange={(e) => setConfirmedNetwork(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-xs text-slate-600 leading-snug">
              I confirm that I transferred exactly <strong className="text-slate-900">${expectedAmount} USDT</strong> via the <strong className="text-slate-900">TRON TRC20</strong> network to the specified receiving address.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-xs text-slate-600 leading-snug">
              I understand that submitting this form initiates verification, and keys are issued after confirmed receipt on the blockchain.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting transaction...</span>
              </>
            ) : (
              <span>Submit transaction</span>
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Manual blockchain verification • Zero wallet credentials collected • Delivery directly to email
          </p>
        </div>
      </form>
    </div>
  );
}
