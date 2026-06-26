// tests/orbit.test.ts — TEST_SPEC A / B 対応（軌道計算とデータ整合性）
import { describe, it, expect } from 'vitest';
import { orbitalAngle, planetPositionAU } from '@/domain/orbit';
import type { PlanetPhysical } from '@/domain/types';
import { PLANETS } from '@/data/planets';

const EPS = 1e-9;
const EPS_PHYS = 0.05;

// テスト用の素直な惑星（phase0=0, a=1, T=1）
const earthLike: PlanetPhysical = {
  id: 'test',
  name: 'テスト',
  semiMajorAxisAU: 1,
  orbitalPeriodYears: 1,
  radiusKm: 6371,
  color: '#fff',
  rotationPeriodHours: 24,
  axialTiltDeg: 0,
  phase0: 0,
};

describe('A. 軌道計算 domain/orbit.ts', () => {
  it('A-1. 決定性: 同じ (planet, t) で常に同一値', () => {
    const a = planetPositionAU(earthLike, 0.37);
    const b = planetPositionAU(earthLike, 0.37);
    expect(a).toEqual(b);
    expect(planetPositionAU(earthLike, 0.37)).toEqual(a);
  });

  it('A-2. 初期位置: phase0=0 は t=0 で (a,0,0), y は常に 0', () => {
    const p = planetPositionAU(earthLike, 0);
    expect(p.x).toBeCloseTo(1, 12);
    expect(p.y).toBe(0);
    expect(p.z).toBeCloseTo(0, 12);
  });

  it('A-3. 四分の一周/半周', () => {
    const q = planetPositionAU(earthLike, 0.25); // T/4 → (0,0,a)
    expect(Math.abs(q.x)).toBeLessThan(EPS);
    expect(q.z).toBeCloseTo(1, 12);
    const h = planetPositionAU(earthLike, 0.5); // T/2 → (-a,0,0)
    expect(h.x).toBeCloseTo(-1, 12);
    expect(Math.abs(h.z)).toBeLessThan(EPS);
  });

  it('A-4. 周期性: position(t) ≈ position(t+T)', () => {
    for (const t of [0, 0.13, 0.42, 0.9]) {
      const a = planetPositionAU(earthLike, t);
      const b = planetPositionAU(earthLike, t + earthLike.orbitalPeriodYears);
      expect(Math.abs(a.x - b.x)).toBeLessThan(EPS);
      expect(Math.abs(a.z - b.z)).toBeLessThan(EPS);
    }
  });

  it('A-5. 軌道半径の保存: sqrt(x²+z²) == semiMajorAxisAU', () => {
    for (const planet of PLANETS) {
      for (const t of [0, 0.3, 1.7, 5.5, 42]) {
        const p = planetPositionAU(planet, t);
        const r = Math.hypot(p.x, p.z);
        expect(Math.abs(r - planet.semiMajorAxisAU)).toBeLessThan(EPS);
      }
    }
  });

  it('A-6. 公転面: 全惑星・全 t で y === 0', () => {
    for (const planet of PLANETS) {
      for (const t of [0, 1, 7.3, 100]) {
        expect(planetPositionAU(planet, t).y).toBe(0);
      }
    }
  });

  it('A-7. 防御的入力: period <= 0 で例外', () => {
    expect(() => orbitalAngle(0, 1)).toThrow();
    expect(() => orbitalAngle(-1, 1)).toThrow();
    expect(() =>
      planetPositionAU({ ...earthLike, orbitalPeriodYears: 0 }, 1)
    ).toThrow();
  });

  it('orbitalAngle: 連続値でラップしない（phase0 反映）', () => {
    expect(orbitalAngle(1, 0, 0)).toBeCloseTo(0, 12);
    expect(orbitalAngle(1, 1, 0)).toBeCloseTo(2 * Math.PI, 12);
    expect(orbitalAngle(1, 2, 0)).toBeCloseTo(4 * Math.PI, 12);
    expect(orbitalAngle(1, 0, 0.5)).toBeCloseTo(0.5, 12);
  });
});

describe('B. ケプラー第三法則 data/planets.ts', () => {
  it('B-1. T²/a³ がほぼ一定（地球基準 ≈ 1.0）', () => {
    const ratios = PLANETS.map(
      (p) => p.orbitalPeriodYears ** 2 / p.semiMajorAxisAU ** 3
    );
    const mean = ratios.reduce((s, x) => s + x, 0) / ratios.length;
    expect(mean).toBeCloseTo(1.0, 1);
    for (const r of ratios) {
      expect(Math.abs(r - mean) / mean).toBeLessThanOrEqual(EPS_PHYS);
    }
  });

  it('B-2. 内側ほど速い（a 昇順で T も単調増加）', () => {
    const sorted = [...PLANETS].sort(
      (a, b) => a.semiMajorAxisAU - b.semiMajorAxisAU
    );
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].orbitalPeriodYears).toBeGreaterThan(
        sorted[i - 1].orbitalPeriodYears
      );
    }
  });

  it('B-3. データ完全性: 8惑星・id 一意・数値フィールドが正の有限値', () => {
    expect(PLANETS).toHaveLength(8);
    const ids = new Set(PLANETS.map((p) => p.id));
    expect(ids.size).toBe(8);
    for (const p of PLANETS) {
      expect(Number.isFinite(p.semiMajorAxisAU) && p.semiMajorAxisAU > 0).toBe(true);
      expect(Number.isFinite(p.orbitalPeriodYears) && p.orbitalPeriodYears > 0).toBe(true);
      expect(Number.isFinite(p.radiusKm) && p.radiusKm > 0).toBe(true);
      // rotationPeriodHours は符号可・非ゼロ・有限
      expect(Number.isFinite(p.rotationPeriodHours) && p.rotationPeriodHours !== 0).toBe(true);
    }
  });
});
