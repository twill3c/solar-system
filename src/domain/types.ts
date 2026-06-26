// src/domain/types.ts
// ドメイン層の型定義。Three.js / React に一切依存しない純粋 TypeScript。

export interface PlanetPhysical {
  id: string;
  name: string; // 日本語表示名
  semiMajorAxisAU: number; // 軌道半径 (AU) — v1 では円軌道半径として使用
  orbitalPeriodYears: number; // 公転周期 (地球年)
  radiusKm: number; // 赤道半径 (km)
  color: string; // プレースホルダ色 (hex)
  rotationPeriodHours: number; // 自転周期。負値=逆行
  axialTiltDeg: number; // 自転軸傾斜（v1 は保持のみ）
  phase0?: number; // 初期位相（rad）省略時 0
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
