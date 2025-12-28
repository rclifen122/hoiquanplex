'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentWaitingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payments/${params.id}/status`);
        const data = await response.json();

        setIsChecking(false);

        // Redirect if payment is completed
        if (data.status === 'succeeded') {
          router.push(`/payment/${params.id}/success`);
        } else if (data.status === 'cancelled' || data.is_expired) {
          router.push(`/payment/${params.id}/expired`);
        }
      } catch {
        setIsChecking(false);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then check every 10 seconds
    const interval = setInterval(checkPaymentStatus, 10000);

    return () => clearInterval(interval);
  }, [params.id, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Animated Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-blue-200"></div>
            <div className="absolute top-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-blue-600"></div>
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Đang chờ xác nhận thanh toán
        </h1>
        <p className="mb-6 text-gray-600">
          Thanh toán của bạn đang được xử lý. Vui lòng đợi trong giây lát...
        </p>

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            {isChecking ? 'Đang kiểm tra...' : 'Trạng thái: Đang chờ'}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Trang này sẽ tự động cập nhật mỗi 10 giây
          </p>
        </div>

        <div className="mt-8 space-y-3 text-sm text-gray-600">
          <p>✓ Thanh toán sẽ được xác nhận trong vòng 24 giờ</p>
          <p>✓ Bạn có thể đóng trang này và quay lại sau</p>
          <p>✓ Email xác nhận sẽ được gửi khi hoàn tất</p>
        </div>

        <button
          onClick={() => router.push(`/payment/${params.id}`)}
          className="mt-8 text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Quay lại trang thanh toán
        </button>
      </div>
    </div>
  );
}
