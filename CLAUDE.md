# CLAUDE.md

このリポジトリで Claude Code が作業するときの運用ルール。実装の詳細は `docs/IMPLEMENTATION_GUIDE.md`、要件は `docs/SPEC.md`、テストの観点は `docs/TEST_SPEC.md` を正典とする。本ファイルは「どう振る舞うか」を定める。

## プロジェクト概要

ブラウザ上で動く簡易的な太陽系シミュレーター。Three.js (React Three Fiber) で太陽と8惑星を描画し、時間スライダーで公転を進める。Vercel への静的デプロイを着地点とする練習プロジェクト。物理的厳密性ではなく**可視化の見栄えと、ロジック/描画の分離によるテスト容易性**を目的とする。

## 最重要の設計原則：三層分離

この原則を崩す変更は受け入れない。

1. **ドメイン層** (`src/domain/`) — Three.js / React に一切依存しない純粋 TypeScript。軌道角度・座標・スケーリングを純粋関数として実装する。ここが単体テストの対象。
2. **データ層** (`src/data/`) — 惑星の物理パラメータを静的 config として定義。ロジックを持たない。
3. **描画層** (`src/components/`, `src/app/`) — R3F コンポーネント。ドメイン層の計算結果を「消費して描くだけ」。座標計算を描画層に書かない。

> 判断に迷ったら「これは Three.js なしでテストできるか?」を問う。できるべき計算が描画層に漏れていたら、それはバグ。

## スケールに関する不変条件

実スケールでは何も見えない（太陽が巨大、惑星は点、距離は桁違い）。本プロジェクトは**意図的にスケールを圧縮した可視化モデル**である。

- 距離・半径の圧縮は `src/domain/scale.ts` の純粋関数に集約する。マジックナンバーを描画層に散らさない。
- 軌道計算は実単位（距離=AU、周期=地球年）で行い、描画直前にのみスケール変換を適用する。この順序を守る。

## やること / やらないこと

- v1 のスコープは `docs/SPEC.md` の「v1 スコープ」に厳密に従う。楕円軌道・衛星・Bloom 等は v2 送りで、勝手に先取りしない。
- 新しい npm パッケージを追加する前に必ず確認を取る。バージョンは下記ピン留めを尊重する。
- 物理ロジックを変更したら、対応する `docs/TEST_SPEC.md` のテストを必ず更新・追加する。

## 依存バージョン（ピン留め）

互換性確認済み。勝手に上げない。

| パッケージ | バージョン |
|---|---|
| next | 16.2.9 |
| react / react-dom | 19.2.7 |
| three | 0.185.0 |
| @react-three/fiber | 9.6.1 |
| @react-three/drei | 10.7.7 |
| @react-three/postprocessing | 3.0.4 (v2) |
| typescript | 6.0.3 |
| tailwindcss | 4.3.1 |
| vitest | 4.1.9 |
| @playwright/test | 1.61.1 |

R3F 9 は React 19 (`>=19 <19.3`) と three `>=0.156` を要求する。上記はすべてこれを満たす。

## SSR の落とし穴（必読）

WebGL はブラウザ専用。R3F の `<Canvas>` を含むコンポーネントは必ず:

- ファイル先頭に `'use client'` を付ける
- ページからは `dynamic(() => import(...), { ssr: false })` で読み込む

これを怠ると `next build` が `window is not defined` で失敗する。新しい 3D コンポーネントを足すたびにこの規約を守る。

## コマンド

```bash
npm run dev          # 開発サーバ
npm run build        # 本番ビルド（SSRエラーの検出を兼ねる）
npm run test         # vitest（ドメイン層の単体テスト）
npm run test:e2e     # playwright（描画スモークテスト）
npm run lint
npm run typecheck    # tsc --noEmit
npm run verify:scale # スケール係数の不変条件チェック（python3 scripts/verify_scale.py）
```

`verify:scale` は `src/domain/scale.ts` の係数が「太陽非干渉・軌道非重複・最小可視サイズ・順序保存・ケプラー第三法則」を満たすか検証し、違反があれば非ゼロ終了する。係数を触ったら必ず実行する。

## 完了の定義（Definition of Done）

タスクは以下をすべて満たして初めて完了とする。

- `npm run typecheck` がエラーなし
- `npm run test` が全パス（新規ロジックには対応テストが存在する）
- `npm run build` が成功（= SSR 規約違反がない）
- **`src/domain/scale.ts` の係数を変更した場合は `npm run verify:scale` が成功すること**
- 三層分離の原則を破っていない
