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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-3xl shadow-2xl h-full flex flex-col justify-center items-center group">
          {/* Glow Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-plex-yellow/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <h3 className="relative z-10 text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-plex-yellow/20 text-plex-yellow ring-1 ring-plex-yellow/50">
              <Smartphone className="h-5 w-5" />
            </div>
            Scan to Pay
          </h3>

          <div className="relative z-10 bg-white p-4 rounded-2xl shadow-2xl ring-4 ring-white/10 transition-transform duration-500 group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vietQrUrl}
              alt="VietQR Payment Code"
              className="h-64 w-64 object-contain rounded-lg"
              loading="lazy"
            />
          </div>

          <div className="relative z-10 mt-8 space-y-3 text-center">
            <p className="text-sm font-medium text-gray-300">
              Open your <strong>Mobile Banking App</strong>
            </p>
            <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-relaxed">
              Scan this code to auto-fill amount & description.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MANUAL DETAILS */}
      <div className="lg:col-span-7 space-y-6">

        {/* Important Info Card */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-blue-900/10 p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-20 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <h3 className="relative z-10 text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Required Transfer Content
          </h3>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-black/40 border border-blue-500/20 p-5 shadow-inner">
            <div className="text-center sm:text-left">
              <p className="text-4xl font-black text-white tracking-widest font-mono shadow-black drop-shadow-lg">
                {paymentCode}
              </p>
              <p className="text-[10px] text-blue-300/80 mt-2 uppercase font-bold tracking-widest">
                Exact content required
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(paymentCode, 'code')}
              className="shrink-0 p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-400 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              title="Copy Code"
            >
              {copiedField === 'code' ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Amount Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl shadow-lg hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Amount</p>
              <p className="text-4xl font-black text-white mt-1 tracking-tight">{formatCurrency(amount)}</p>
            </div>
            <button
              onClick={() => copyToClipboard(amount.toString(), 'amount')}
              className="p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              {copiedField === 'amount' ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl shadow-lg space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-4">
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
        <div className="flex gap-4 p-5 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 items-start">
          <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-yellow-500 text-sm">Payment Verification</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
              After transfer, please allow <strong>3-6 hours</strong> for our team to verify and activate your plan.
              <br /><span className="opacity-70">For faster support, contact us with your payment receipt.</span>
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
