'use client';

import { useState } from 'react';
import { Copy, Check, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface BankTransferDetailsProps {
  paymentCode: string;
  amount: number;
  bankDetails: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
  };
}

export function BankTransferDetails({
  paymentCode,
  amount,
  bankDetails,
}: BankTransferDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const vietQrUrl = `https://img.vietqr.io/image/${bankDetails.bankCode}-${bankDetails.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(paymentCode)}&accountName=${encodeURIComponent(bankDetails.accountName)}`;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

      {/* LEFT COLUMN: QR CODE (Center Stage) */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center shadow-2xl h-full flex flex-col justify-center items-center group">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-plex-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <h3 className="relative z-10 text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-plex-yellow" />
            Scan to Pay
          </h3>

          <div className="relative z-10 bg-white p-4 rounded-2xl shadow-lg ring-4 ring-white/10 transition-transform duration-500 group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vietQrUrl}
              alt="VietQR Payment Code"
              className="h-64 w-64 object-contain rounded-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                VietQR Supported
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 space-y-2">
            <p className="text-sm text-gray-400">
              Open your <strong>Mobile Banking App</strong>
            </p>
            <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
              Scan this code to auto-fill amount & description.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MANUAL DETAILS */}
      <div className="lg:col-span-7 space-y-6">

        {/* Important Info Card */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Required Transfer Content
          </h3>
          <div className="flex items-center justify-between rounded-xl bg-black/30 border border-white/10 p-4">
            <div>
              <p className="text-3xl font-black text-white tracking-widest">{paymentCode}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Exact content required</p>
            </div>
            <button
              onClick={() => copyToClipboard(paymentCode, 'code')}
              className="p-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
              title="Copy Code"
            >
              {copiedField === 'code' ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Amount Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-4xl font-black text-white mt-1">{formatCurrency(amount)}</p>
            </div>
            <button
              onClick={() => copyToClipboard(amount.toString(), 'amount')}
              className="p-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              {copiedField === 'amount' ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-3">
            Bank Account Details
          </h3>

          <InfoRow
            label="Bank Name"
            value={bankDetails.bankName}
            subValue={bankDetails.bankCode}
            onCopy={() => copyToClipboard(bankDetails.bankName, 'bank')}
            copied={copiedField === 'bank'}
          />

          <InfoRow
            label="Account Number"
            value={bankDetails.accountNumber}
            onCopy={() => copyToClipboard(bankDetails.accountNumber, 'account')}
            copied={copiedField === 'account'}
            highlight
          />

          <InfoRow
            label="Account Name"
            value={bankDetails.accountName}
            onCopy={() => copyToClipboard(bankDetails.accountName, 'name')}
            copied={copiedField === 'name'}
          />
        </div>

        {/* Confirmation Note */}
        <div className="flex gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <ShieldCheck className="h-6 w-6 text-green-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-green-400 text-sm">Automated Verification</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              System will automatically verify your payment within <strong>5-10 minutes</strong> after transfer.
              Please keep your transfer receipt just in case.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  subValue,
  onCopy,
  copied,
  highlight = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className={cn("mt-1 font-bold tracking-tight", highlight ? "text-xl text-plex-yellow" : "text-white text-lg")}>
          {value}
        </p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="p-2 rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
