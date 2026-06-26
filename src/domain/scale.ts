// src/domain/scale.ts
// 可視化用スケーリング係数。実データで「軌道非重複・最小可視サイズ・太陽非干渉」を
// 検証済み（プリセットA: 最小軌道余白 +0.31, 太陽余白 +3.88）。
// 係数を変更したら docs/TEST_SPEC.md の C-2 / C-5 を必ず再検証すること。

// ─────────────────────────────────────────────
// 距離スケール：scaledDistance(au) = sqrt(au) * DISTANCE_K
//   実距離レンジ 0.387〜30.07 AU (78x) を 6.2〜54.8 (8.8x) に圧縮。
//   sqrt により内惑星の密集を緩和しつつ外惑星を画面内に収める。
// ─────────────────────────────────────────────
export const DISTANCE_K = 10.0;

// ─────────────────────────────────────────────
// 半径スケール：scaledRadius(km) = MIN_SIZE + max(0, log10(km) - LOG_BASE) * RADIUS_K
//   log10 で太陽(696,000km)と惑星(2,440〜69,911km)の桁差を圧縮。
//   LOG_BASE=log10(2000)付近を基準に取り、MIN_SIZE で最小可視サイズを保証。
//   惑星半径レンジ 0.31〜1.33 (4.3x)、太陽 2.03。
// ─────────────────────────────────────────────
export const RADIUS_K = 0.7;
export const LOG_BASE = 3.3; // ≈ log10(2000)
export const MIN_SIZE = 0.25;

// ─────────────────────────────────────────────
// 時間スケール：t(年) += realSeconds * YEARS_PER_SEC * speed
//   YEARS_PER_SEC=0.05 のとき speed=1 で地球が約20秒/周。
//   公転周期は水星0.24年〜海王星165年(684x)と幅広いため、
//   倍率プリセットで海王星まで動いて見える範囲をカバーする。
//   speed=100 で海王星 ≈ 33秒/周。
// ─────────────────────────────────────────────
export const YEARS_PER_SEC = 0.05;
export const SPEED_PRESETS = [0.25, 1, 4, 20, 100] as const;

// ─────────────────────────────────────────────
// カメラ目安（Scene.tsx 用の参考値、scale非依存だが整合のためここに併記）
//   シーン全体の視界半径 ≈ 55.8 単位。初期カメラとfar平面はこれを包含する。
// ─────────────────────────────────────────────
export const SCENE_RADIUS = 56;            // 海王星 outer の概算
export const CAMERA_INITIAL: [number, number, number] = [0, 35, 80];
export const CAMERA_FAR = 200;

export function scaledDistance(au: number): number {
  return Math.sqrt(au) * DISTANCE_K;
}

export function scaledRadius(km: number, opts?: { minSize?: number }): number {
  const minSize = opts?.minSize ?? MIN_SIZE;
  return minSize + Math.max(0, Math.log10(km) - LOG_BASE) * RADIUS_K;
}

// ─────────────────────────────────────────────
// 対案: プリセットC（コンパクト・惑星を相対的に大きく見せる）
//   切り替える場合は上の定数を以下で置換し、TEST_SPEC C-2/C-5 を再検証。
//   ※ 最小軌道余白が +0.12 と狭いため、惑星半径を増やす変更とは併用しない。
//     DISTANCE_K = 8.5
//     RADIUS_K   = 0.6
//     MIN_SIZE   = 0.28
//     視界半径 ≈ 47.5
// ─────────────────────────────────────────────
