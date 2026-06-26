# アーキテクチャ

ハーネス・スキャフォールド（4ファイルの規約）が全体を規定し、`src/` を三層に分離する。
依存方向は一方向（データ層 → ドメイン層 → 描画層）で、描画層はドメイン層の計算結果を消費するだけ。
純粋TSのドメイン層のみが検証対象となり、GitHub 経由で Vercel に公開される。

```mermaid
flowchart TD
    subgraph scaffold["ハーネス・スキャフォールド（規約）"]
        direction LR
        C[CLAUDE.md]
        S[SPEC.md]
        I[IMPL_GUIDE.md]
        T[TEST_SPEC.md]
    end

    subgraph src["src/ ― 三層分離（依存方向 →）"]
        direction LR
        DATA["データ層<br/>静的config<br/>惑星データ・係数"]
        DOMAIN["ドメイン層<br/>純粋TS・テスト対象<br/>軌道・スケール・自転"]
        RENDER["描画層<br/>R3F・消費のみ<br/>Scene・Planet 等"]
        DATA --> DOMAIN --> RENDER
    end

    VITEST["vitest<br/>ドメイン層の単体テスト"]
    VERIFY["verify_scale.py<br/>係数ゲート（違反で停止）"]
    GH["GitHub<br/>push 連携"]
    VC["Vercel<br/>自動ビルド・公開"]

    scaffold -->|全体を規定| src
    VITEST -. 検証 .-> DOMAIN
    VERIFY -. 検証 .-> DOMAIN
    src --> GH --> VC

    classDef data   fill:#E6F1FB,stroke:#185FA5,color:#042C53;
    classDef domain fill:#E1F5EE,stroke:#0F6E56,color:#04342C;
    classDef render fill:#FAECE7,stroke:#993C1D,color:#4A1B0C;
    classDef test   fill:#EAF3DE,stroke:#3B6D11,color:#173404;
    classDef gate   fill:#FAEEDA,stroke:#854F0B,color:#412402;
    classDef deploy fill:#EEEDFE,stroke:#534AB7,color:#26215C;

    class DATA data;
    class DOMAIN domain;
    class RENDER render;
    class VITEST test;
    class VERIFY gate;
    class GH,VC deploy;
```

## 読み方

- **規約（上段）**: 4ファイルのスキャフォールドが要件・実装指針・テスト観点を定め、実装全体を規定する。
- **三層分離（中段）**: 依存は左から右への一方向。描画層は座標計算を持たず、ドメイン層の純粋関数の結果を描くだけ。描画を差し替えてもロジックは無傷。
- **検証（点線）**: `vitest`（単体テスト）と `verify_scale.py`（係数ゲート）はいずれも Three.js 非依存のドメイン層を対象とし、高速に回せる。ゲートは不変条件違反で非ゼロ終了し、完了の定義に組み込まれる。
- **公開（下段）**: GitHub への push を Vercel が検知し、自動ビルド・公開する。

> 配色はライトテーマ向けに調整してある。GitHub のダークテーマで見づらい場合は末尾の `classDef` 群を削除すると、テーマ標準色でレンダリングされる。
