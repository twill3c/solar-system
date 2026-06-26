'use client';
// src/components/Sun.tsx
// 中心の太陽。自発光マテリアルで点光源も兼ねる。
// 半径はドメイン層の scaledRadius を消費するだけ（座標計算は持たない）。

import { scaledRadius } from '@/domain/scale';
import { SUN_RADIUS_KM } from '@/data/planets';

export default function Sun() {
  const radius = scaledRadius(SUN_RADIUS_KM);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color="#ffcf57"
          emissive="#ff9d2f"
          emissiveIntensity={1.6}
        />
      </mesh>
      {/* 太陽位置からの点光源（惑星を照らす） */}
      <pointLight position={[0, 0, 0]} intensity={2.2} distance={0} decay={0} color="#fff3d6" />
    </group>
  );
}
