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

### Step 1: スキーマ定義 & 登録

**スキル: cmx-schema** を使用。

site-config.md のサイト種別・トーンに合ったコレクション設計を提案。

**1-1. 既存コレクションの確認**

```bash
npx cmx-sdk list-collections
```

既存データと重複がないことを確認する。

**1-2. JSON生成とユーザー確認**

```
以下のコレクションを作成します:

- 名前: {name}
- スラッグ: {slug}
- タイプ: {type}

重複はありません。こちらで登録してもよろしいですか？
```

**1-3. cmx-sdk で登録**

承認されたら、`cmx-sdk` コマンドで登録:

```bash
npx cmx-sdk create-collection --json '{"type":"{type}","slug":"{slug}","name":"{name}","description":"{description}"}'
```

**1-4. 付属データタイプの確認**

コレクション作成時にプリセットが自動適用される。追加したい場合:

```bash
# 現在の付属データタイプを確認
npx cmx-sdk list-collection-data-types --collection {slug}

# おすすめプリセットを確認
npx cmx-sdk list-collection-presets --type {type}

# プリセットから追加
npx cmx-sdk add-collection-data-type --collection {slug} --preset authors
```

### Step 2: テストデータ

付属データタイプがある場合はエントリも作成:

```bash
# カテゴリエントリ作成
npx cmx-sdk create-data-entry --type-slug {slug}-categories --json '{"name":"カテゴリ名"}'
```

Admin 側で 2-3 件のコンテンツを作成し「公開」にするよう案内。
コンテンツ作成後、必要に応じて参照を設定（Admin API `PUT /contents/:id/references`）。

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
