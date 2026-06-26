// tests/scale.test.ts — TEST_SPEC C 対応（スケーリング）
import { describe, it, expect } from 'vitest';
import { scaledDistance, scaledRadius, MIN_SIZE } from '@/domain/scale';
import { PLANETS, SUN_RADIUS_KM } from '@/data/planets';

describe('C. スケーリング domain/scale.ts', () => {
  it('C-1. 距離の単調増加: a1<a2 ⇒ scaledDistance(a1)<scaledDistance(a2)', () => {
    const samples = [0.1, 0.387, 0.723, 1, 1.524, 5.203, 9.537, 19.191, 30.069, 50];
    for (let i = 1; i < samples.length; i++) {
      expect(scaledDistance(samples[i])).toBeGreaterThan(scaledDistance(samples[i - 1]));
    }
    // ランダム組
    for (let k = 0; k < 200; k++) {
      const a1 = Math.random() * 40 + 0.01;
      const a2 = a1 + Math.random() * 10 + 0.001;
      expect(scaledDistance(a2)).toBeGreaterThan(scaledDistance(a1));
    }
  });

  it('C-2. 順序保存: 実 AU 順 == scaledDistance 適用後の順', () => {
    const byReal = [...PLANETS].sort((a, b) => a.semiMajorAxisAU - b.semiMajorAxisAU).map((p) => p.id);
    const byScaled = [...PLANETS]
      .sort((a, b) => scaledDistance(a.semiMajorAxisAU) - scaledDistance(b.semiMajorAxisAU))
      .map((p) => p.id);
    expect(byScaled).toEqual(byReal);
  });

  it('C-3. 半径の正値性・有界性: 全惑星で正の有限値, MIN_SIZE 下限', () => {
    for (const p of PLANETS) {
      const r = scaledRadius(p.radiusKm);
      expect(Number.isFinite(r)).toBe(true);
      expect(r).toBeGreaterThan(0);
      expect(r).toBeGreaterThanOrEqual(MIN_SIZE - 1e-9);
    }
    // 太陽も有限・正
    const sun = scaledRadius(SUN_RADIUS_KM);
    expect(Number.isFinite(sun)).toBe(true);
    expect(sun).toBeGreaterThan(0);
  });

  it('C-4. 半径の単調性: km1<km2 ⇒ scaledRadius(km1) <= scaledRadius(km2)', () => {
    const kms = [...PLANETS.map((p) => p.radiusKm), SUN_RADIUS_KM].sort((a, b) => a - b);
    for (let i = 1; i < kms.length; i++) {
      expect(scaledRadius(kms[i])).toBeGreaterThanOrEqual(scaledRadius(kms[i - 1]));
    }
    // 下限近傍（log10-LOG_BASE<0）の領域でも等号で潰れる方向に単調
    expect(scaledRadius(100)).toBeLessThanOrEqual(scaledRadius(1000));
  });

  it('C-5. 視認性（回帰防止）: 最小惑星 radius が最近接軌道間隔に対し小さすぎない', () => {
    // 最小惑星（水星）
    const mercury = PLANETS.reduce((m, p) => (p.radiusKm < m.radiusKm ? p : m));
    const rMin = scaledRadius(mercury.radiusKm);

    // 最近接の隣接軌道間隔（描画半径を引いた素の orbit 間隔）
    const orbits = [...PLANETS]
      .sort((a, b) => a.semiMajorAxisAU - b.semiMajorAxisAU)
      .map((p) => scaledDistance(p.semiMajorAxisAU));
    let minGap = Infinity;
    for (let i = 1; i < orbits.length; i++) {
      minGap = Math.min(minGap, orbits[i] - orbits[i - 1]);
    }

    // 点に潰れない閾値: 最小惑星半径は最近接軌道間隔の 10% 以上
    expect(rMin).toBeGreaterThan(minGap * 0.1);
    // 絶対下限としても可視
    expect(rMin).toBeGreaterThanOrEqual(MIN_SIZE - 1e-9);
  });
});
