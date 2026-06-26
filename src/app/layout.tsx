import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '太陽系シミュレーター',
  description:
    'Three.js (React Three Fiber) による簡易太陽系シミュレーター。円軌道の可視化モデル（v1）。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
