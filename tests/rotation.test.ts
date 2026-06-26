// tests/rotation.test.ts — TEST_SPEC D 対応（自転）
import { describe, it, expect } from 'vitest';
import { spinAngle } from '@/domain/rotation';

describe('D. 自転 domain/rotation.ts', () => {
  it('D-1. 単調性と符号: 正で増加, 負（逆行）で減少', () => {
    // 順行（period > 0）
    const ts = [0, 0.01, 0.05, 0.2, 1];
    for (let i = 1; i < ts.length; i++) {
      expect(spinAngle(24, ts[i])).toBeGreaterThan(spinAngle(24, ts[i - 1]));
    }
    // 逆行（period < 0, 例: 金星 -5832.5h）
    for (let i = 1; i < ts.length; i++) {
      expect(spinAngle(-5832.5, ts[i])).toBeLessThan(spinAngle(-5832.5, ts[i - 1]));
    }
  });

  it('D-2. 決定性: 同じ入力で常に同一値', () => {
    expect(spinAngle(23.9, 0.333)).toBe(spinAngle(23.9, 0.333));
    expect(spinAngle(-17.2, 2.5)).toBe(spinAngle(-17.2, 2.5));
  });

  it('防御的入力: 0 や非有限で例外', () => {
    expect(() => spinAngle(0, 1)).toThrow();
    expect(() => spinAngle(Infinity, 1)).toThrow();
    expect(() => spinAngle(NaN, 1)).toThrow();
  });

  it('t=0 では自転角 0', () => {
    expect(spinAngle(24, 0)).toBeCloseTo(0, 12);
    expect(spinAngle(-5832.5, 0)).toBeCloseTo(0, 12);
  });
});
