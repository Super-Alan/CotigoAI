import type { Metadata } from 'next';
import '@/styles/globals.css';
import Providers from '@/components/Providers';

// 使用系统字体以避免 Google Fonts 连接问题
// Inter 字体回退到系统 sans-serif 字体栈

export const metadata: Metadata = {
  title: 'Cogito AI - 批判性思维数智导师',
  description: '一款基于苏格拉底式对话的批判性思维训练平台',
  keywords: ['批判性思维', '苏格拉底', 'AI导师', '论证分析'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
