'use client';

import { useState, useRef } from 'react';
import { updateCustomerAvatar } from '@/lib/auth/customer-actions';
import { Customer } from '@/lib/auth/customer-auth-helpers';

interface CustomerAvatarUploadProps {
  customer: Customer;
}

export function CustomerAvatarUpload({ customer }: CustomerAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(customer.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Kích thước file không được vượt quá 2MB' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API route
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update avatar URL in database
      const updateResult = await updateCustomerAvatar(result.url);

      if (updateResult.success) {
        setPreviewUrl(result.url);
        setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
      } else {
        throw new Error(updateResult.error || 'Update failed');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải ảnh lên',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {message && (
        <div
          className={`mb-4 rounded-lg p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center space-x-6">
        {/* Avatar Preview */}
        <div className="relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={customer.full_name}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white ring-4 ring-gray-100">
              {getInitials(customer.full_name)}
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? 'Đang tải lên...' : 'Chọn ảnh mới'}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG hoặc GIF. Tối đa 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
