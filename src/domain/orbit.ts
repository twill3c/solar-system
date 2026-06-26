// src/domain/orbit.ts
// 円軌道の角度・座標を計算する純粋関数。Three.js / React 非依存・テスト対象。

import type { PlanetPhysical, Vec3 } from './types';

/**
 * 時刻 t（年）における軌道上の角度（rad）。
 * 意図的にラップしない連続値（テストで連続性・周期性を確認するため）。
 *
 * @throws periodYears が 0 以下なら例外（防御的入力）
 */
export function orbitalAngle(
  periodYears: number,
  tYears: number,
  phase0 = 0
): number {
  if (!(periodYears > 0)) {
    throw new Error(
      `orbitalAngle: periodYears must be > 0, got ${periodYears}`
    );
  }
  return 2 * Math.PI * (tYears / periodYears) + phase0;
}

/**
 * 円軌道上の 3D 座標を AU 単位・黄道面 (y=0) で返す。
 * スケール変換は含めない（描画直前にのみ適用する規約）。
 *
 *   x = a*cos(θ),  z = a*sin(θ),  y = 0   （a = semiMajorAxisAU）
 */
export function planetPositionAU(
  planet: PlanetPhysical,
  tYears: number
): Vec3 {
  const theta = orbitalAngle(
    planet.orbitalPeriodYears,
    tYears,
    planet.phase0 ?? 0
  );
  const a = planet.semiMajorAxisAU;
  return {
    x: a * Math.cos(theta),
    y: 0,
    z: a * Math.sin(theta),
  };
}
