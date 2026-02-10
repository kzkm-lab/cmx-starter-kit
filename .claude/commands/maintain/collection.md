---
description: 新しいコレクションを追加する（スキーマ → Admin 登録 → コード生成 → ページ実装まで一貫）
argument-hint: [コレクションの用途や名前]
---

# コレクション追加

**使用するスキル: cmx-schema → cmx-dev**

## 参照

- @cmx/site-config.md（サイト方針との整合性を確認）

## 手順

入力: $ARGUMENTS

### Step 1: スキーマ定義

**スキル: cmx-schema** を使用。

site-config.md のサイト種別・トーンに合ったコレクション設計を提案。
コレクション JSON を生成し、Admin UI の「JSON からインポート」手順を案内する。

### Step 2: テストデータ

Admin 側で 2-3 件のコンテンツを作成し「公開」にするよう案内。

### Step 3: コード再生成 & ページ scaffold

```bash
npx cmx-sdk generate
npx cmx-sdk scaffold --only collections:{slug}
```

生成コードの確認:
- `cmx/generated/collections/{slug}.ts` — 型付き取得関数
- `src/app/{slug}/page.tsx` — 一覧ページ雛形（scaffold）
- `src/app/{slug}/[slug]/page.tsx` — 詳細ページ雛形（scaffold）

### Step 4: ページカスタマイズ

scaffold で生成された雛形の HTML/CSS をカスタマイズ:

1. `src/lib/constants/collections.ts` にスラッグ追加
2. `src/app/{slug}/page.tsx` — 一覧ページのデザイン調整
3. `src/app/{slug}/[slug]/page.tsx` — 詳細ページのデザイン調整

site-config.md のデザイン方針に沿ったスタイリングを行う。

### Step 5: ナビゲーション更新

`src/components/layout/Header.tsx` にリンクを追加。

### Step 6: 動作確認

開発サーバーでページの表示を確認する。
