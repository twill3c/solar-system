'use client';
// src/components/Starfield.tsx
// drei <Stars> の薄いラッパ。星空背景。

import { Stars } from '@react-three/drei';

export default function Starfield() {
  return (
    <Stars
      radius={150}
      depth={60}
      count={4000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}
