'use client';
// src/components/Scene.tsx
// <Canvas> ルート。WebGL 専用のため 'use client' 必須、かつ page から ssr:false で読む。
// 共有時刻 t を props で受け取り、各惑星へ配る（座標計算は各 Planet がドメイン層経由で確定）。

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CAMERA_INITIAL, CAMERA_FAR } from '@/domain/scale';
import { PLANETS } from '@/data/planets';
import Sun from './Sun';
import Planet from './Planet';
import OrbitLine from './OrbitLine';
import Starfield from './Starfield';

interface SceneProps {
  tYears: number;
}

export default function Scene({ tYears }: SceneProps) {
  return (
    <Canvas camera={{ position: CAMERA_INITIAL, fov: 50, far: CAMERA_FAR }}>
      <color attach="background" args={['#05060c']} />
      <ambientLight intensity={0.18} />

      <Starfield />
      <Sun />

      {PLANETS.map((planet) => (
        <OrbitLine key={`orbit-${planet.id}`} semiMajorAxisAU={planet.semiMajorAxisAU} />
      ))}

      {PLANETS.map((planet) => (
        <Planet key={planet.id} planet={planet} tYears={tYears} />
      ))}

      <OrbitControls enablePan enableZoom enableRotate makeDefault />
    </Canvas>
  );
}
