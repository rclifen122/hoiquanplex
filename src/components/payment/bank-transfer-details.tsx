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

  const transferContent = `${paymentCode} ${formatCurrency(amount)}`;

  return (
    <div className="space-y-6">
      {/* Payment Code - Most Important */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="mb-3 text-sm font-medium text-blue-900">
          Mã thanh toán (Ghi vào nội dung chuyển khoản)
        </h3>
        <div className="flex items-center justify-between rounded-lg bg-white p-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">{paymentCode}</p>
            <p className="mt-1 text-sm text-gray-600">
              Vui lòng ghi chính xác mã này
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(paymentCode, 'code')}
            className="rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700 transition-colors"
          >
            {copiedField === 'code' ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Transfer Amount */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Số tiền chuyển khoản</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(amount)}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(amount.toString(), 'amount')}
            className="rounded-lg border border-gray-300 p-2.5 hover:bg-gray-50 transition-colors"
          >
            {copiedField === 'amount' ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Bank Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-900">
          Thông tin tài khoản nhận
        </h3>
        <div className="space-y-3">
          <InfoRow
            label="Ngân hàng"
            value={`${bankDetails.bankName} (${bankDetails.bankCode})`}
            onCopy={() =>
              copyToClipboard(bankDetails.accountNumber, 'account')
            }
            copied={copiedField === 'bank'}
          />
          <InfoRow
            label="Số tài khoản"
            value={bankDetails.accountNumber}
            onCopy={() =>
              copyToClipboard(bankDetails.accountNumber, 'account')
            }
            copied={copiedField === 'account'}
            important
          />
          <InfoRow
            label="Chủ tài khoản"
            value={bankDetails.accountName}
            onCopy={() => copyToClipboard(bankDetails.accountName, 'name')}
            copied={copiedField === 'name'}
          />
          {bankDetails.branch && (
            <InfoRow label="Chi nhánh" value={bankDetails.branch} />
          )}
        </div>
      </div>

      {/* Transfer Content Template */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-3 font-semibold text-gray-900">Nội dung chuyển khoản</h3>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <code className="text-sm font-medium text-gray-900">
            {transferContent}
          </code>
          <button
            onClick={() => copyToClipboard(transferContent, 'content')}
            className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 transition-colors"
          >
            {copiedField === 'content' ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          * Sao chép toàn bộ nội dung này khi chuyển khoản
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-amber-50 p-4">
        <h4 className="mb-2 font-semibold text-amber-900">⚠️ Lưu ý quan trọng</h4>
        <ul className="space-y-1 text-sm text-amber-800">
          <li>• Chuyển khoản <strong>chính xác</strong> số tiền {formatCurrency(amount)}</li>
          <li>• Ghi <strong>đúng mã thanh toán</strong> {paymentCode} vào nội dung</li>
          <li>• Thanh toán sẽ được xác nhận trong vòng 24 giờ</li>
          <li>• Liên hệ admin nếu có vấn đề</li>
        </ul>
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
  onCopy?: () => void;
  copied?: boolean;
  important?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`mt-0.5 font-medium ${important ? 'text-lg text-blue-600' : 'text-gray-900'}`}>
          {value}
        </p>
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
