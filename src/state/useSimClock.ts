'use client';
// src/state/useSimClock.ts
// シミュレーション時刻 t（年）の進行を司るフック。
// requestAnimationFrame で t を加算し、再生/一時停止・速度・手動シークを両立する。
// ドメイン層には依存しない（係数 YEARS_PER_SEC / SPEED_PRESETS のみ参照）。

import { useCallback, useEffect, useRef, useState } from 'react';
import { YEARS_PER_SEC, SPEED_PRESETS } from '@/domain/scale';

export interface SimClock {
  /** シミュレーション時刻（年） */
  t: number;
  isPlaying: boolean;
  /** 速度倍率（SPEED_PRESETS のいずれか） */
  speed: number;
  /** スライダー等からの手動設定 */
  setT: (t: number) => void;
  togglePlay: () => void;
  setSpeed: (s: number) => void;
  /** 手動シーク中は自動加算を止める（true=シーク中） */
  setSeeking: (seeking: boolean) => void;
  speedPresets: readonly number[];
}

export function useSimClock(initialT = 0): SimClock {
  const [t, setTState] = useState(initialT);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeedState] = useState<number>(1);

  // rAF ループからは ref を読む（再描画と独立に最新値を参照するため）
  const tRef = useRef(initialT);
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const seekingRef = useRef(false);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const setT = useCallback((next: number) => {
    tRef.current = next;
    setTState(next);
  }, []);

  const setSpeed = useCallback((s: number) => setSpeedState(s), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const setSeeking = useCallback((seeking: boolean) => {
    seekingRef.current = seeking;
    // シーク終了後の dt 基準をリセットし、停止中の経過時間が一気に加算されるのを防ぐ
    lastRef.current = null;
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      if (playingRef.current && !seekingRef.current) {
        tRef.current += dt * YEARS_PER_SEC * speedRef.current;
        setTState(tRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return {
    t,
    isPlaying,
    speed,
    setT,
    togglePlay,
    setSpeed,
    setSeeking,
    speedPresets: SPEED_PRESETS,
  };
}
