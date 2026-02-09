---
description: 新しいデータタイプを追加する（スキーマ → Admin 登録 → コード生成 → ページ実装まで一貫）
argument-hint: [データタイプの用途や名前]
---

# データタイプ追加

**使用するスキル: cmx-schema → cmx-dev**

## 参照

- @cmx/site-config.md（サイト方針との整合性を確認）

## 手順

入力: $ARGUMENTS

### Step 1: スキーマ定義

**スキル: cmx-schema** を使用。

site-config.md のサイト種別に合ったデータ構造を提案。
データタイプ JSON を生成し、Admin UI の「JSON からインポート」手順を案内する。

### Step 2: テストデータ

Admin 側で数件のエントリを作成するよう案内。

### Step 3: コード再生成

```bash
npx cmx-sdk generate
```

### Step 4: ページ実装

**スキル: cmx-dev** のデータ型ページ作成パターンに従い:

1. `src/app/{path}/page.tsx` — 一覧ページ（生成済み型付き関数を使用）
2. 必要に応じて詳細ページも作成

site-config.md のデザイン方針に沿ったスタイリングを行う。

### Step 5: ナビゲーション更新（必要な場合）

`src/components/layout/Header.tsx` にリンクを追加。

### Step 6: 動作確認

開発サーバーでページの表示を確認する。
