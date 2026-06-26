'use client';
// src/components/OrbitLine.tsx
// 円軌道を表す XZ 平面上のリング（線分ループ）。
// 半径は scaledDistance(semiMajorAxisAU) のみを消費する。

import { useMemo } from 'react';
import * as THREE from 'three';
import { scaledDistance } from '@/domain/scale';

interface OrbitLineProps {
  semiMajorAxisAU: number;
  segments?: number;
  color?: string;
}

export default function OrbitLine({
  semiMajorAxisAU,
  segments = 160,
  color = '#3a4a6b',
}: OrbitLineProps) {
  const geometry = useMemo(() => {
    const r = scaledDistance(semiMajorAxisAU);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [semiMajorAxisAU, segments]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.6} />
    </lineLoop>
  );
}
