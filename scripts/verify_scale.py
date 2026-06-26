#!/usr/bin/env python3
"""
scripts/verify_scale.py

src/domain/scale.ts のスケール係数が、可視化上の不変条件を満たすか検証する。
係数を変更したら本スクリプトを実行し、緑であることを確認すること。
不変条件を一つでも破ると非ゼロ終了するため、ローカルゲート / CI に組み込める。

検証する不変条件（docs/TEST_SPEC.md 対応）:
  - 太陽非干渉 : 最内惑星の inner > 太陽の描画半径
  - 軌道非重複 : 隣接惑星が描画半径込みで重ならない（C-2）
  - 最小可視  : 全惑星の描画半径 >= MIN_SIZE（C-5）
  - 順序保存  : 実距離の順序と圧縮後の順序が一致（C-2）
  - ケプラー  : T^2 / a^3 がほぼ一定（B-1, データ整合性）

使い方:
  python3 scripts/verify_scale.py          # 検証して結果を表示
  python3 scripts/verify_scale.py --table   # 数値テーブルも表示
"""

from __future__ import annotations
import sys
import math
from dataclasses import dataclass

# ─────────────────────────────────────────────
# src/domain/scale.ts と同期させる係数（プリセットA）
# ここを変えたら scale.ts も合わせること。
# ─────────────────────────────────────────────
DISTANCE_K = 10.0
RADIUS_K = 0.7
LOG_BASE = 3.3
MIN_SIZE = 0.25

# 許容誤差
EPS_PHYS = 0.05  # ケプラー第三法則の相対誤差

# ─────────────────────────────────────────────
# 惑星データ（src/data/planets.ts と同期。NASA Planetary Fact Sheet 近似値）
# (name, semi_major_axis_AU, orbital_period_yr, radius_km)
# ─────────────────────────────────────────────
PLANETS = [
    ("水星", 0.387, 0.241, 2439.7),
    ("金星", 0.723, 0.615, 6051.8),
    ("地球", 1.000, 1.000, 6371.0),
    ("火星", 1.524, 1.881, 3389.5),
    ("木星", 5.203, 11.862, 69911.0),
    ("土星", 9.537, 29.457, 58232.0),
    ("天王星", 19.191, 84.011, 25362.0),
    ("海王星", 30.069, 164.790, 24622.0),
]
SUN_KM = 696000.0


def scaled_distance(au: float) -> float:
    return math.sqrt(au) * DISTANCE_K


def scaled_radius(km: float) -> float:
    return MIN_SIZE + max(0.0, math.log10(km) - LOG_BASE) * RADIUS_K


@dataclass
class Row:
    name: str
    au: float
    period: float
    km: float
    orbit: float
    radius: float

    @property
    def inner(self) -> float:
        return self.orbit - self.radius

    @property
    def outer(self) -> float:
        return self.orbit + self.radius


def build_rows() -> list[Row]:
    return [
        Row(n, au, p, km, scaled_distance(au), scaled_radius(km))
        for n, au, p, km in PLANETS
    ]


class Checker:
    def __init__(self) -> None:
        self.failures: list[str] = []

    def check(self, ok: bool, label: str, detail: str = "") -> None:
        mark = "OK " if ok else "NG "
        print(f"  [{mark}] {label}{('  ' + detail) if detail else ''}")
        if not ok:
            self.failures.append(label)


def run(show_table: bool) -> int:
    rows = build_rows()
    sun_r = scaled_radius(SUN_KM)
    chk = Checker()

    print(f"係数: DISTANCE_K={DISTANCE_K}, RADIUS_K={RADIUS_K}, "
          f"LOG_BASE={LOG_BASE}, MIN_SIZE={MIN_SIZE}\n")

    if show_table:
        print(f"  {'天体':<5}{'orbit':>8}{'radius':>8}{'inner':>8}{'outer':>8}")
        print(f"  {'太陽':<5}{0.0:>8.2f}{sun_r:>8.2f}{'-':>8}{'-':>8}")
        for r in rows:
            print(f"  {r.name:<5}{r.orbit:>8.2f}{r.radius:>8.2f}"
                  f"{r.inner:>8.2f}{r.outer:>8.2f}")
        print()

    print("不変条件:")

    # 1. 太陽非干渉
    sun_clear = rows[0].inner - sun_r
    chk.check(sun_clear > 0, "太陽非干渉（最内惑星 inner > 太陽半径）",
              f"余白 {sun_clear:+.2f}")

    # 2. 軌道非重複（隣接）
    min_gap = math.inf
    worst = ""
    for a, b in zip(rows, rows[1:]):
        gap = b.inner - a.outer
        if gap < min_gap:
            min_gap, worst = gap, f"{a.name}->{b.name}"
    chk.check(min_gap > 0, "軌道非重複（隣接惑星が重ならない）",
              f"最小余白 {min_gap:+.2f} @ {worst}")

    # 3. 最小可視サイズ
    chk.check(all(r.radius >= MIN_SIZE - 1e-9 for r in rows),
              "最小可視サイズ（全惑星 radius >= MIN_SIZE）")

    # 4. 順序保存（実距離順 == 圧縮後距離順）
    by_real = [r.name for r in sorted(rows, key=lambda r: r.au)]
    by_scaled = [r.name for r in sorted(rows, key=lambda r: r.orbit)]
    chk.check(by_real == by_scaled, "順序保存（距離圧縮が単調）")

    # 5. ケプラー第三法則（T^2/a^3 ≈ 一定）
    ratios = [r.period ** 2 / r.au ** 3 for r in rows]
    mean = sum(ratios) / len(ratios)
    max_dev = max(abs(x - mean) / mean for x in ratios)
    chk.check(max_dev <= EPS_PHYS,
              "ケプラー第三法則（T^2/a^3 ほぼ一定）",
              f"最大相対偏差 {max_dev:.4f} (許容 {EPS_PHYS})")

    print()
    if chk.failures:
        print(f"結果: NG — {len(chk.failures)} 件の不変条件違反")
        for f in chk.failures:
            print(f"  - {f}")
        return 1

    print("結果: 全不変条件クリア")
    return 0


if __name__ == "__main__":
    show_table = "--table" in sys.argv[1:]
    sys.exit(run(show_table))
