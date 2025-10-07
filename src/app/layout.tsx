import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/Providers';

// SF Pro 风格的西文字体 - Inter 是最接近的开源替代
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Cogito AI - 批判性思维数智导师',
  description: '一款基于苏格拉底式对话的批判性思维训练平台',
  keywords: ['批判性思维', '苏格拉底', 'AI导师', '论证分析'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
