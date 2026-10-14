'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, AlertCircle, Info } from 'lucide-react';

interface WalletPaymentCardProps {
  walletAddress: string;
  priceUsdt?: number;
}

export default function WalletPaymentCard({
  walletAddress,
  priceUsdt = 200,
}: WalletPaymentCardProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);

  const copyToClipboard = async (text: string, type: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'address') {
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2500);
      } else {
        setAmountCopied(true);
        setTimeout(() => setAmountCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div
      id="payment-section"
      className="rounded-2xl border border-slate-800 bg-[#0d1424]/90 p-6 md:p-8 shadow-xl shadow-black/40 backdrop-blur-md glow-subtle"
    >
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-medium tracking-wide uppercase text-blue-400">
              TRC20 Wallet Payment
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              Pay ${priceUsdt} USDT
            </h2>
          </div>
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300">
            Network: TRON (TRC20)
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-300">
          Send the exact requested amount to the wallet address below using the TRON TRC20 network.
        </p>
      </div>

      {/* Main Grid: QR Code & Wallet Address Details */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* QR Code Container */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="p-3 bg-white rounded-xl shadow-md ring-1 ring-slate-800 flex items-center justify-center">
            {/* Scannable QR encoding the exact configured merchant address */}
            <QRCodeSVG
              value={walletAddress}
              size={180}
              level="H"
              includeMargin={false}
              className="w-40 h-40 sm:w-44 sm:h-44"
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
            <QrCode className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium">Scan with TronLink, Trust Wallet, Binance</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 text-center">
            QR code encodes the official recipient TRON address.
          </p>
        </div>

        {/* Address and Amount Details */}
        <div className="lg:col-span-7 space-y-4">
          {/* Amount Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Exact Amount to Send</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Fixed 1:1
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">
                {priceUsdt}.00 <span className="text-sm font-semibold text-blue-400">USDT</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(priceUsdt.toString(), 'amount')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
              >
                {amountCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Amount</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Merchant Wallet Address Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Merchant Recipient Address</span>
              <span className="text-[11px] font-mono text-blue-300">TRON Network</span>
            </div>

            {/* Address with safe wrapping, never truncating copy value */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs sm:text-sm text-blue-200 break-all select-all font-semibold tracking-wide">
              {walletAddress}
            </div>

            {/* Copy Button */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(walletAddress, 'address')}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {addressCopied ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400">
                Starts with <strong className="text-white font-mono">{walletAddress.slice(0, 4)}</strong>, ends with <strong className="text-white font-mono">{walletAddress.slice(-4)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Compatibility Warning Box */}
      <div className="mt-6 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-300">
              Important: Send USDT using TRON TRC20 only.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Do not send through ERC20, BEP20, Polygon, or another network unless explicitly supported. Transferring assets through an incompatible network or non-USDT tokens will result in irreversible loss of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Notices */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
        <div className="flex items-start gap-2 rounded-lg bg-slate-900/30 p-3 border border-slate-800/60">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Network Fees:</strong> Ensure your sending wallet or exchange covers the TRON network fee (typically 13–28 TRX or standard exchange fee) so that exactly {priceUsdt} USDT arrives.
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-slate-900/30 p-3 border border-slate-800/60">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Verify Destination:</strong> Please double-check the recipient address on your wallet screen against the address displayed above before approving the broadcast.
          </span>
        </div>
      </div>
    </div>
  );
}
