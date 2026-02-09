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

### Step 3: コード再生成

```bash
npx cmx-sdk generate
```

### Step 4: ページ実装

**スキル: cmx-dev** のコレクションページ作成パターンに従い:

1. `src/lib/constants/collections.ts` にスラッグ追加
2. `src/app/{slug}/page.tsx` — 一覧ページ
3. `src/app/{slug}/[slug]/page.tsx` — 詳細ページ（MDX レンダリング付き）

site-config.md のデザイン方針に沿ったスタイリングを行う。

### Step 5: ナビゲーション更新

`src/components/layout/Header.tsx` にリンクを追加。

### Step 6: 動作確認

開発サーバーでページの表示を確認する。
