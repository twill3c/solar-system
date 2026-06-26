// src/data/planets.ts
// 惑星の物理パラメータ（静的 config）。ロジックは持たない。
//
// 出典: NASA Planetary Fact Sheet 近似値
//   https://nssdc.gsfc.nasa.gov/planetary/factsheet/
//   - semiMajorAxisAU : 軌道長半径（AU, 太陽=1.0 基準）
//   - orbitalPeriodYears : 公転周期（地球年）。ケプラー第三法則 T²≈a³ が成立。
//   - radiusKm : 赤道半径（km）
//   - rotationPeriodHours : 自転周期（h）。負値=逆行（金星・天王星）。
//   - axialTiltDeg : 自転軸傾斜（deg, v1 は保持のみ）
//
// phase0 は初期位相（rad）。実天文位置との一致は非目標のため、
// 見栄え（初期の重なり回避）の目的で惑星ごとにずらしている。

import type { PlanetPhysical } from '../domain/types';

/** 太陽の赤道半径（km）。描画・スケール検証用。 */
export const SUN_RADIUS_KM = 696000.0;

export const PLANETS: PlanetPhysical[] = [
  {
    id: 'mercury',
    name: '水星',
    semiMajorAxisAU: 0.387,
    orbitalPeriodYears: 0.241,
    radiusKm: 2439.7,
    color: '#9e9e9e',
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.034,
    phase0: 0.0,
  },
  {
    id: 'venus',
    name: '金星',
    semiMajorAxisAU: 0.723,
    orbitalPeriodYears: 0.615,
    radiusKm: 6051.8,
    color: '#d9b38c',
    rotationPeriodHours: -5832.5, // 逆行自転
    axialTiltDeg: 177.4,
    phase0: 0.8,
  },
  {
    id: 'earth',
    name: '地球',
    semiMajorAxisAU: 1.0,
    orbitalPeriodYears: 1.0,
    radiusKm: 6371.0,
    color: '#4f80d6',
    rotationPeriodHours: 23.9,
    axialTiltDeg: 23.4,
    phase0: 1.6,
  },
  {
    id: 'mars',
    name: '火星',
    semiMajorAxisAU: 1.524,
    orbitalPeriodYears: 1.881,
    radiusKm: 3389.5,
    color: '#c1440e',
    rotationPeriodHours: 24.6,
    axialTiltDeg: 25.2,
    phase0: 2.4,
  },
  {
    id: 'jupiter',
    name: '木星',
    semiMajorAxisAU: 5.203,
    orbitalPeriodYears: 11.862,
    radiusKm: 69911.0,
    color: '#d8a87b',
    rotationPeriodHours: 9.9,
    axialTiltDeg: 3.1,
    phase0: 3.1,
  },
  {
    id: 'saturn',
    name: '土星',
    semiMajorAxisAU: 9.537,
    orbitalPeriodYears: 29.457,
    radiusKm: 58232.0,
    color: '#e0c79a',
    rotationPeriodHours: 10.7,
    axialTiltDeg: 26.7,
    phase0: 3.9,
  },
  {
    id: 'uranus',
    name: '天王星',
    semiMajorAxisAU: 19.191,
    orbitalPeriodYears: 84.011,
    radiusKm: 25362.0,
    color: '#9fd6e0',
    rotationPeriodHours: -17.2, // 逆行自転（横倒し）
    axialTiltDeg: 97.8,
    phase0: 4.7,
  },
  {
    id: 'neptune',
    name: '海王星',
    semiMajorAxisAU: 30.069,
    orbitalPeriodYears: 164.79,
    radiusKm: 24622.0,
    color: '#3f63c9',
    rotationPeriodHours: 16.1,
    axialTiltDeg: 28.3,
    phase0: 5.5,
  },
];
