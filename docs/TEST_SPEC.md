# TEST_SPEC.md — 太陽系シミュレーター

テストの観点と合否基準。ドメイン層（純粋関数）を主戦場とし、描画層は最小限のスモークに留める。Claude Code はロジック変更時に該当テストを必ず追加・更新する。

## テスト戦略

- **単体テスト（vitest）**: `src/domain/` の純粋関数。決定性・物理法則・スケール性質を検証。ここが品質の中心。
- **スモークテスト（Playwright）**: Canvas がマウントされ、致命的エラーなく描画されることのみ確認。ピクセル単位の検証はしない。
- ドメイン層は Three.js / React に非依存なので、描画なしで高速にテストできる。これが本構成の最大の利点。

数値比較は浮動小数のため許容誤差 `EPS = 1e-9`（角度・座標）、`EPS_PHYS = 0.05`（物理法則の相対誤差）を用いる。

---

## A. 軌道計算 `domain/orbit.ts`

### A-1. 決定性
同じ `(planet, t)` に対し `planetPositionAU` は常に同一の値を返す。複数回呼んでも完全一致。

### A-2. 初期位置
`phase0 = 0` の惑星は `t = 0` で `(a, 0, 0)`（a = semiMajorAxisAU）。`y` 成分は常に 0。

### A-3. 四分の一周
周期 `T` の惑星は `t = T/4` で角度 π/2 → 位置はおよそ `(0, 0, a)`（誤差 `EPS`）。半周 `T/2` で `(-a, 0, 0)`。

### A-4. 周期性
任意の t について `planetPositionAU(p, t)` ≈ `planetPositionAU(p, t + T)`（誤差 `EPS`）。整数周回後に始点へ戻る。

### A-5. 軌道半径の保存
任意の t で原点からの距離 `sqrt(x²+z²)` は `semiMajorAxisAU` に一致（円軌道の不変条件、誤差 `EPS`）。

### A-6. 公転面
すべての惑星・すべての t で `y === 0`。

### A-7. 防御的入力
`orbitalPeriodYears <= 0` を渡すと例外を投げる。

---

## B. ケプラー第三法則 `data/planets.ts`（データ整合性）

### B-1. T² ∝ a³
全8惑星について `orbitalPeriodYears² / semiMajorAxisAU³` がほぼ一定（地球基準で約 1.0、相対誤差 `EPS_PHYS` 以内）。実データの妥当性チェックを兼ねる。

### B-2. 内側ほど速い
`semiMajorAxisAU` で昇順ソートしたとき、`orbitalPeriodYears` も単調増加する（水星が最速、海王星が最遅）。

### B-3. データ完全性
8惑星すべてが存在し、`id` が一意。全数値フィールドが正の有限値（`rotationPeriodHours` は符号可・非ゼロ）。

---

## C. スケーリング `domain/scale.ts`

### C-1. 距離の単調増加
`scaledDistance` は厳密に単調増加：`a1 < a2 ⇒ scaledDistance(a1) < scaledDistance(a2)`。ランダム/代表値の組で検証。

### C-2. 距離の順序保存
惑星データを実 AU でソートした順序と、`scaledDistance` 適用後の順序が一致する（軌道の重なり・追い越しが起きない）。

### C-3. 半径の正値性・有界性
`scaledRadius(km)` は全惑星で正の有限値を返し、`minSize` 下限を下回らない。

### C-4. 半径の単調性
`km1 < km2 ⇒ scaledRadius(km1) <= scaledRadius(km2)`（最小サイズ下限により等号を許容）。

### C-5. 視認性（回帰防止）
最小惑星（水星）の `scaledRadius` が、最近接軌道間隔に対して小さすぎない（点に潰れない）ことを閾値で確認。スケール係数を変更した際の事故防止用。

---

## D. 自転 `domain/rotation.ts`

### D-1. 単調性と符号
`rotationPeriodHours > 0` で `spinAngle` は t に対し増加、`< 0`（逆行、例：金星）で減少。

### D-2. 決定性
同じ入力で常に同一値。

---

## E. 描画スモーク（Playwright）`tests/e2e/scene.spec.ts`

### E-1. マウント
ページを開くと `<canvas>` 要素が DOM に存在する。

### E-2. コンソールエラーなし
ロード〜数秒の間に `console.error` および未捕捉例外が発生しない（WebGL 警告は除外フィルタ可）。

### E-3. 操作 UI の存在
時間スライダーと再生/一時停止コントロールが表示・操作可能。

### E-4. （任意）描画の変化
再生後にキャンバスの内容が初期フレームから変化する（スクリーンショット差分。フレーキー回避のため許容差を緩めに）。

---

## カバレッジ方針

- `src/domain/**` は分岐網羅を目標（ロジックの心臓部）。
- 描画コンポーネントのカバレッジは追わない（スモークで代替）。
- CI 相当として `npm run typecheck && npm run test && npm run build` をローカル必須ゲートとする。
