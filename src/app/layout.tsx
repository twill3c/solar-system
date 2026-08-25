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
      <body>
        {children}
        {/* フリート標準の下部固定フッタ(MIT / GitHub / 歩き方 / 設計図 / App Menu) */}
        <footer className="fleet-footer">
          <p>
            <a
              href="https://github.com/twill3c/solar-system/blob/main/LICENSE"
              target="_blank"
              rel="noopener"
            >
              MIT License
            </a>{' '}
            © 2026 坂田哲朗 ・{' '}
            <a
              href="https://github.com/twill3c/solar-system"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>{' '}
            ・{' '}
            <a
              href="https://claude.ai/code/artifact/6de9a554-e568-4098-89c2-d97ccebf32bf"
              target="_blank"
              rel="noopener"
            >
              太陽系の動かし方
            </a>{' '}
            ・{' '}
            <a
              href="https://claude.ai/code/artifact/f0a10787-42e5-41e0-9fce-9ef276ec2b97"
              target="_blank"
              rel="noopener"
            >
              太陽系シミュレーター設計図
            </a>{' '}
            ・{' '}
            <a
              href="https://app-menu-amber.vercel.app"
              target="_blank"
              rel="noopener"
            >
              App Menu
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
