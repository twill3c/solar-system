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
      <body>{children}
        <footer class="fleet-footer"><p><a href="https://github.com/twill3c/solar-system/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a> © 2026 坂田哲朗 ・ <a href="https://github.com/twill3c/solar-system" target="_blank" rel="noopener">GitHub</a> ・ <a href="https://app-menu-amber.vercel.app" target="_blank" rel="noopener">App Menu</a></p></footer>
      </body>
    </html>
  );
}
