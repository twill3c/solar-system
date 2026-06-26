'use client';
// src/components/SolarSystemApp.tsx
// クライアント側のルート。共有時刻 t（useSimClock）を保持し、
// Canvas を含む Scene を ssr:false で動的読み込みして DOM オーバーレイ（Controls）と重ねる。
// Scene を ssr:false にすることで next build の `window is not defined` を回避する。

import dynamic from 'next/dynamic';
import { useSimClock } from '@/state/useSimClock';
import Controls from './Controls';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className="scene-loading">読み込み中…</div>,
});

export default function SolarSystemApp() {
  const clock = useSimClock();

  return (
    <main className="app-root">
      <header className="app-header">
        <h1 className="app-title">太陽系シミュレーター</h1>
        <p className="app-subtitle">
          時間スライダーで公転を進める可視化モデル（v1・円軌道）
        </p>
      </header>

      <div className="scene-layer">
        <Scene tYears={clock.t} />
      </div>

      <Controls clock={clock} />
    </main>
  );
}
