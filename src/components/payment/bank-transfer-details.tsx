'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

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
    <div className="space-y-8">
      {/* 1. QR Code Section - Center Stage */}
      <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Quét mã để thanh toán</h3>
        <div className="relative aspect-square w-64 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vietQrUrl}
            alt="VietQR Payment Code"
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
        <p className="text-center text-sm text-gray-500 max-w-xs">
          Sử dụng <strong>App Ngân hàng</strong> hoặc <strong>Ví điện tử</strong> để quét mã.
          Thông tin chuyển khoản sẽ được điền tự động.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 2. Manual Transfer Details */}
        <div className="space-y-6">
          {/* Payment Code */}
          <div className="rounded-lg bg-blue-50 p-6">
            <h3 className="mb-3 text-sm font-medium text-blue-900">
              Mã thanh toán (Nội dung CK)
            </h3>
            <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
              <div>
                <p className="text-2xl font-bold text-blue-600 tracking-tight">{paymentCode}</p>
                <p className="mt-1 text-xs text-blue-400 font-medium uppercase">
                  Bắt buộc ghi đúng mã này
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(paymentCode, 'code')}
                className="rounded-lg bg-blue-100 p-2.5 text-blue-600 hover:bg-blue-200 transition-colors"
                title="Sao chép"
              >
                {copiedField === 'code' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Số tiền cần chuyển</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 tracking-tight">
                  {formatCurrency(amount)}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(amount.toString(), 'amount')}
                className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100 transition-colors"
              >
                {copiedField === 'amount' ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Bank Account Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-full">
          <h3 className="mb-4 font-bold text-gray-900 border-b border-gray-100 pb-2">
            Thông tin tài khoản
          </h3>
          <div className="space-y-4">
            <InfoRow
              label="Ngân hàng"
              value={bankDetails.bankName}
              subValue={bankDetails.bankCode}
              onCopy={() => copyToClipboard(bankDetails.bankName, 'bank')}
              copied={copiedField === 'bank'}
            />
            <InfoRow
              label="Số tài khoản"
              value={bankDetails.accountNumber}

              onCopy={() => copyToClipboard(bankDetails.accountNumber, 'account')}
              copied={copiedField === 'account'}
              important
            />
            <InfoRow
              label="Chủ tài khoản"
              value={bankDetails.accountName}
              onCopy={() => copyToClipboard(bankDetails.accountName, 'name')}
              copied={copiedField === 'name'}
            />
          </div>
        </div>
      </div>

      {/* 4. Confirmation / Instructions */}
      <div className="rounded-xl bg-amber-50 p-6 border border-amber-100">
        <div className="flex gap-4">
          <div className="p-3 bg-amber-100 rounded-full h-fit text-amber-600 shrink-0">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-amber-900">Xác nhận thanh toán</h4>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              Sau khi chuyển khoản thành công, hệ thống sẽ tự động ghi nhận trong vòng <strong>5-10 phút</strong>.
              Nếu quá thời gian trên chưa thấy cập nhật, vui lòng liên hệ Admin và cung cấp <strong>Mã thanh toán</strong>.
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
  onCopy,
  copied,
  important = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  onCopy?: () => void;
  copied?: boolean;
  important?: boolean;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className={`mt-0.5 font-bold ${important ? 'text-lg text-blue-600 tracking-tight' : 'text-gray-900'}`}>
          {value}
        </p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-gray-400" />
          )}
        </button>
      )}
    </div>
  );
}
