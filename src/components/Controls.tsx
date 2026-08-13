'use client';
// src/components/Controls.tsx
// 時間スライダー・再生/一時停止・速度切り替えの DOM オーバーレイ。
// 状態は useSimClock（props.clock）に委譲し、ここは表示と入力のみ。

import type { SimClock } from '@/state/useSimClock';

const T_MAX = 60; // スライダー上限（年）。spec「0〜数十年」に従う。

interface ControlsProps {
  clock: SimClock;
}

export default function Controls({ clock }: ControlsProps) {
  const { t, isPlaying, speed, setT, togglePlay, setSpeed, setSeeking, speedPresets } = clock;

  return (
    <div className="controls" role="group" aria-label="シミュレーション操作">
      <button
        type="button"
        className="ctrl-btn"
        onClick={togglePlay}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '一時停止' : '再生'}
      >
        {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
      </button>

      <div className="slider-wrap">
        <label htmlFor="time-slider" className="ctrl-label">
          時刻 t = {t.toFixed(2)} 年
        </label>
        <input
          id="time-slider"
          className="time-slider"
          type="range"
          min={0}
          max={T_MAX}
          step={0.05}
          value={Math.min(t, T_MAX)}
          onPointerDown={() => setSeeking(true)}
          onPointerUp={() => setSeeking(false)}
          onChange={(e) => setT(Number(e.target.value))}
          aria-label="シミュレーション時刻（年）"
        />
      </div>

      <div className="speed-wrap" role="group" aria-label="速度">
        <span className="ctrl-label">速度</span>
        {speedPresets.map((s) => (
          <button
            type="button"
            key={s}
            className={`speed-btn${s === speed ? ' active' : ''}`}
            aria-pressed={s === speed}
            onClick={() => setSpeed(s)}
          >
            ×{s}
          </button>
        ))}
      </div>

      <a
        className="app-menu-link"
        href="https://app-menu-amber.vercel.app"
        target="_blank"
        rel="noopener"
      >
        App Menu
      </a>
    </div>
  );
}
