# IMPLEMENTATION_GUIDE.md — 太陽系シミュレーター

`SPEC.md` を「どう実装するか」に翻訳した指針。Claude Code はこのファイルの層構造とインターフェースに従って実装する。

## 1. ディレクトリ構成

```
solar-system/
├─ CLAUDE.md
├─ docs/
│  ├─ SPEC.md
│  ├─ IMPLEMENTATION_GUIDE.md
│  └─ TEST_SPEC.md
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  └─ page.tsx            # Scene を dynamic import (ssr:false)
│  ├─ components/
│  │  ├─ Scene.tsx           # 'use client' — <Canvas> ルート
│  │  ├─ Sun.tsx
│  │  ├─ Planet.tsx          # 単一惑星（位置はドメイン層から受け取る）
│  │  ├─ OrbitLine.tsx       # 円軌道リング
│  │  ├─ Starfield.tsx       # drei <Stars> ラッパ
│  │  └─ Controls.tsx        # 時間スライダー・再生/速度（DOMオーバーレイ）
│  ├─ domain/                # ★ Three.js / React 非依存・テスト対象
│  │  ├─ types.ts
│  │  ├─ orbit.ts            # 軌道角度・座標（円軌道）
│  │  ├─ scale.ts            # 距離・半径の圧縮
│  │  └─ rotation.ts         # 自転角
│  ├─ data/
│  │  └─ planets.ts          # 静的惑星データ（PlanetPhysical[]）
│  └─ state/
│     └─ useSimClock.ts      # 時刻 t（年）の進行を司るフック
├─ tests/
│  ├─ orbit.test.ts
│  ├─ scale.test.ts
│  └─ e2e/scene.spec.ts
├─ scripts/
│  └─ verify_scale.py        # スケール係数の不変条件チェック（ゲート）
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
└─ playwright.config.ts
```

## 2. ドメイン層のインターフェース（最優先で実装）

ここを先に作り、テストを通してから描画層へ進む。すべて純粋関数。

### 2.1 `domain/types.ts`

```ts
export interface PlanetPhysical {
  id: string;
  name: string;                // 日本語表示名
  semiMajorAxisAU: number;     // 軌道半径 (AU)
  orbitalPeriodYears: number;  // 公転周期 (地球年)
  radiusKm: number;            // 赤道半径 (km)
  color: string;               // プレースホルダ色 (hex)
  rotationPeriodHours: number; // 自転周期。負値=逆行
  axialTiltDeg: number;        // 自転軸傾斜（v1は保持のみ）
  phase0?: number;             // 初期位相（rad）省略時0
}

export interface Vec3 { x: number; y: number; z: number; }
```

### 2.2 `domain/orbit.ts`

```ts
// 時刻 t（年）における軌道上の角度（ラップしない連続値, rad）
export function orbitalAngle(periodYears: number, tYears: number, phase0 = 0): number;

// 円軌道上の3D座標を AU 単位・黄道面(y=0)で返す。スケール変換は含めない。
export function planetPositionAU(planet: PlanetPhysical, tYears: number): Vec3;
```

実装規約:
- `orbitalAngle = 2π * (t / period) + phase0`。意図的にラップしない（テストで連続性を確認するため）。
- `planetPositionAU`: `x = a*cos(θ)`, `z = a*sin(θ)`, `y = 0`（a = `semiMajorAxisAU`）。
- 入力 period が 0 以下なら例外を投げる（防御的）。

### 2.3 `domain/scale.ts`

```ts
// AU → シーン単位。内外惑星を画面に収めるため圧縮する。単調増加であること。
export function scaledDistance(au: number): number;

// km → シーン単位の描画半径。対数圧縮＋最小可視サイズ保証。
export function scaledRadius(km: number, opts?: { minSize?: number }): number;
```

実装規約:
- `scaledDistance` は既定で `Math.sqrt(au) * DISTANCE_K` のような圧縮。**厳密に単調増加**（テスト対象）。
- `scaledRadius` は `Math.log10(km) * RADIUS_K` ベース＋`minSize` 下限。常に正の有限値を返す。
- 係数 `DISTANCE_K`, `RADIUS_K`, `minSize` はこのファイル冒頭の定数に集約。

**確定係数（プリセットA、実データで検証済み）**

`scripts/verify_scale.py` で不変条件をすべて満たすことを確認済み。これを初期値とする。

| 定数 | 値 | 役割 |
|---|---|---|
| `DISTANCE_K` | `10.0` | `scaledDistance(au) = √au × 10.0` |
| `RADIUS_K` | `0.7` | 半径の対数圧縮係数 |
| `LOG_BASE` | `3.3` | 半径圧縮の基準（≈ log10(2000)） |
| `MIN_SIZE` | `0.25` | 最小可視半径 |
| `YEARS_PER_SEC` | `0.05` | 時間進行（speed=1 で地球 ≈ 20秒/周） |
| `SPEED_PRESETS` | `[0.25, 1, 4, 20, 100]` | 速度倍率（×100 で海王星 ≈ 33秒/周） |

半径式は実際には基準を引いて `MIN_SIZE + max(0, log10(km) − LOG_BASE) × RADIUS_K` とする（太陽と惑星の桁差を圧縮しつつ下限を保証）。結果はシーン視界半径 ≈ 56 単位、太陽半径 2.03、惑星半径 0.31〜1.33。

> 対案プリセットC（コンパクト）: `DISTANCE_K=8.5, RADIUS_K=0.6, MIN_SIZE=0.28`。視界半径 ≈ 47.5 だが軌道余白が +0.12 と狭いため、惑星を大きくする変更とは併用しない。

**係数変更時の必須手順**: `scale.ts` の定数を変えたら `scripts/verify_scale.py` 内の同名定数も合わせ、`npm run verify:scale` を実行して全不変条件クリアを確認する。金星↔地球が最も詰まりやすい律速点。

### 2.4 `domain/rotation.ts`

```ts
// 時刻 t（年）における自転角（rad, ラップしない）
export function spinAngle(rotationPeriodHours: number, tYears: number): number;
```

## 3. データ層 `data/planets.ts`

`PlanetPhysical[]` を実値ベースで定義。AU と地球年で表現するため、ケプラー第三法則 `T² ≈ a³` がほぼ成立する（テストで検証）。出典（NASA Planetary Fact Sheet 等）を README とコメントに記す。位相 `phase0` は見栄えのため惑星ごとにずらしてよい。

## 4. 描画層

### 4.1 `app/page.tsx`
```tsx
// サーバコンポーネントのまま。Scene を ssr:false で動的読み込み
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });
```
DOM オーバーレイ（Controls）はここで Scene と重ねる。

### 4.2 `components/Scene.tsx`
- 先頭に `'use client'`。
- `<Canvas camera={{ position: CAMERA_INITIAL, fov: 50, far: CAMERA_FAR }}>` をルートに、`<Sun/>`, 各 `<Planet/>`, `<OrbitLine/>`, `<Starfield/>`, `<OrbitControls/>`（drei）を配置。カメラ定数は `scale.ts` の `CAMERA_INITIAL=[0,35,80]`, `CAMERA_FAR=200` を使う（シーン視界半径 ≈ 56 を包含する値）。
- 共有時刻 t は `state/useSimClock` から取得し props で配る。

### 4.3 `components/Planet.tsx`
- props: `planet: PlanetPhysical`, `tYears: number`。
- **自前で軌道計算をしない**。`planetPositionAU(planet, t)` → `scaledDistance` を各軸へ適用して `position` を決める。
- 半径は `scaledRadius(planet.radiusKm)`。自転は `spinAngle` を `rotation.y` に反映。
- `useFrame` は「t を進める」用途に使ってよいが、座標の確定はドメイン関数経由に限る。

### 4.4 `components/OrbitLine.tsx`
- `scaledDistance(semiMajorAxisAU)` を半径とする XZ 平面上のリング（`RingGeometry` か線分ループ）。

### 4.5 状態 `state/useSimClock.ts`
- `t`（年）、`isPlaying`、`speed`（倍率）を保持。`speed` は `scale.ts` の `SPEED_PRESETS` から選ぶ。
- `requestAnimationFrame` または R3F の `useFrame` で `t += dt秒 * YEARS_PER_SEC * speed`。
- スライダーからの手動設定と再生を両立（手動操作中は加算を止める）。

## 5. 実装順序（この順で進める）

1. プロジェクト初期化（Next 16 App Router + TS + Tailwind 4）、バージョンピン留め。
2. `domain/*` と `data/planets.ts` を実装。`scale.ts` は確定係数（2.3節）で初期化。
3. `tests/*.test.ts`（TEST_SPEC 準拠）を書いて **vitest を緑にする**。あわせて `npm run verify:scale` を緑にする。← ここまで描画ゼロ。
4. `Scene` + `Sun` + `Starfield` の最小描画を `ssr:false` で表示（ビルド成功を確認）。
5. `Planet` × 8 と `OrbitLine` をドメイン層消費で実装。
6. `Controls` と `useSimClock` で時間操作を接続。
7. Playwright スモークテスト。
8. Vercel デプロイ。

## 6. つまずきポイント（既知）

- **SSR**: `<Canvas>` を含むものは `'use client'` + `ssr:false`。怠ると `next build` が `window is not defined` で失敗。
- **Tailwind 4**: 設定形式が v3 と異なる（CSS ファースト）。`@import "tailwindcss";` ベースのセットアップに従う。
- **drei のツリーシェイク**: 必要コンポーネントのみ named import する。
- **postprocessing は v1 で入れない**（依存はピン表に記載済みだが導入は v2）。
