# 太陽系シミュレーター

ブラウザ上で動く簡易太陽系シミュレーター。Three.js (React Three Fiber) で太陽と8惑星を描画し、時間スライダーで公転を進める可視化モデル（v1・円軌道）。

物理的厳密性ではなく **可視化の見栄えと、ロジック/描画の分離によるテスト容易性** を目的とする。詳細は [docs/SPEC.md](docs/SPEC.md) / [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) / [docs/TEST_SPEC.md](docs/TEST_SPEC.md) を参照。

## 設計：三層分離

依存方向は一方向（データ層 → ドメイン層 → 描画層）。描画層はドメイン層の純粋関数の計算結果を消費するだけで、座標計算を持たない。

- `src/domain/` — Three.js / React 非依存の純粋 TypeScript（軌道・スケール・自転）。単体テストの対象。
- `src/data/` — 惑星の物理パラメータ（静的 config）。
- `src/components/`, `src/app/` — R3F 描画層。

スケール圧縮（距離・半径・時間）は `src/domain/scale.ts` の純粋関数と係数に集約している。

## コマンド

```bash
npm run dev          # 開発サーバ
npm run build        # 本番ビルド（SSRエラー検出を兼ねる）
npm run test         # vitest（ドメイン層の単体テスト）
npm run test:e2e     # playwright（描画スモークテスト）
npm run lint
npm run typecheck    # tsc --noEmit
npm run verify:scale # スケール係数の不変条件チェック
```

## データ出典

惑星の物理パラメータ（軌道長半径・公転周期・赤道半径・自転周期・軸傾斜）は
**NASA Planetary Fact Sheet** の近似値に基づく。

- https://nssdc.gsfc.nasa.gov/planetary/factsheet/

軌道長半径は AU、公転周期は地球年で表現しており、ケプラー第三法則 `T² ≈ a³` が
ほぼ成立する（`tests/orbit.test.ts` の B-1 および `scripts/verify_scale.py` で検証）。
位相 `phase0` は実天文位置との一致を目的とせず、初期の重なり回避のため惑星ごとにずらしている。

## デプロイ

Vercel への静的デプロイを着地点とする（Hobby 枠で完結・外部 API/サーバ常駐なし）。
`npm run build` が成功すればそのまま静的ホスティング可能。
