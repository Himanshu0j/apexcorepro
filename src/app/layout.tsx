import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tool Activation Checkout — $200 USDT (TRC20)',
  description:
    'Complete your payment of 200 USDT on TRON (TRC20) to request your official software Tool Activation Key.',
  keywords: [
    'USDT TRC20',
    'Tool Activation Key',
    'Software License Checkout',
    'TRON Payment',
    'ApexCore Pro',
  ],
  authors: [{ name: 'ApexCore Technologies' }],
  openGraph: {
    title: 'Tool Activation Checkout — $200 USDT (TRC20)',
    description:
      'Official payment and verification portal for your Tool Activation Key license.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
