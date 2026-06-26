// src/domain/rotation.ts
// 自転角を計算する純粋関数。Three.js / React 非依存・テスト対象。

const HOURS_PER_YEAR = 365.25 * 24;

/**
 * 時刻 t（年）における自転角（rad, ラップしない連続値）。
 * rotationPeriodHours > 0 で増加、< 0（逆行：金星など）で減少する。
 *
 *   spinAngle = 2π * (t年をhに換算 / rotationPeriodHours)
 *
 * @throws rotationPeriodHours が 0 なら例外（防御的入力／自転周期は非ゼロ）
 */
export function spinAngle(
  rotationPeriodHours: number,
  tYears: number
): number {
  if (rotationPeriodHours === 0 || !Number.isFinite(rotationPeriodHours)) {
    throw new Error(
      `spinAngle: rotationPeriodHours must be a non-zero finite number, got ${rotationPeriodHours}`
    );
  }
  const tHours = tYears * HOURS_PER_YEAR;
  return 2 * Math.PI * (tHours / rotationPeriodHours);
}
