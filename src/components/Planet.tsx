'use client';
// src/components/Planet.tsx
// 単一惑星。座標計算は一切持たず、ドメイン層の純粋関数の結果を消費して描くだけ。
//   - 位置: planetPositionAU(planet, t) を scaledDistance でシーン単位へ変換
//   - 半径: scaledRadius(planet.radiusKm)
//   - 自転: spinAngle(planet.rotationPeriodHours, t) を rotation.y に反映

import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { planetPositionAU } from '@/domain/orbit';
import { spinAngle } from '@/domain/rotation';
import { scaledDistance, scaledRadius } from '@/domain/scale';
import type { PlanetPhysical } from '@/domain/types';

interface PlanetProps {
  planet: PlanetPhysical;
  tYears: number;
  showLabel?: boolean;
}

export default function Planet({ planet, tYears, showLabel = true }: PlanetProps) {
  // 半径は時刻に依存しないので memo 化
  const radius = useMemo(() => scaledRadius(planet.radiusKm), [planet.radiusKm]);

  // AU 座標 → シーン単位（軌道半径 a を scaledDistance(a) に写す比率を各軸へ適用）
  const posAU = planetPositionAU(planet, tYears);
  const k = scaledDistance(planet.semiMajorAxisAU) / planet.semiMajorAxisAU;
  const position: [number, number, number] = [posAU.x * k, 0, posAU.z * k];

  const spin = spinAngle(planet.rotationPeriodHours, tYears);

  return (
    <group position={position}>
      <mesh rotation={[0, spin, 0]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={planet.color} roughness={0.85} metalness={0.0} />
      </mesh>
      {showLabel && (
        <Html
          position={[0, radius + 0.6, 0]}
          center
          distanceFactor={40}
          style={{ pointerEvents: 'none' }}
        >
          <span className="planet-label">{planet.name}</span>
        </Html>
      )}
    </group>
  );
}
