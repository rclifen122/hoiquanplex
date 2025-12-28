import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: {
    default: 'HoiQuanPlex CRM - Quản lý khách hàng & Đăng ký dịch vụ',
    template: '%s | HoiQuanPlex CRM',
  },
  description:
    'Hệ thống quản lý khách hàng và đăng ký gói dịch vụ streaming HoiQuanPlex',
  keywords: [
    'HoiQuanPlex',
    'CRM',
    'streaming',
    'subscription management',
    'customer registration',
  ],
  authors: [{ name: 'HoiQuanPlex' }],
  creator: 'HoiQuanPlex',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://hoiquanplex.site',
    title: 'HoiQuanPlex CRM',
    description: 'Hệ thống quản lý khách hàng HoiQuanPlex',
    siteName: 'HoiQuanPlex CRM',
  },
  robots: {
    index: false,
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
