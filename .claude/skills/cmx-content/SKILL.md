---
name: cmx-content
description: |
  CMX Starter Kit のコンテンツ作成・投入スキル。Admin API 経由でのテストデータ投入、既存サイトからのコンテンツ移行、MDX テンプレート。
  トリガー: 「テストデータを入れたい」「記事を投入」「シードデータ」「サイト移行」
  「コンテンツを移行」「既存サイトからインポート」「スクレイピングして記事を作成」
  「ダミーデータ」「サンプル記事」「テスト用の記事」など。
---

# CMX コンテンツ作成・投入

## 事前確認

1. `.env.local` に `CMX_API_KEY` と `CMX_API_URL` が設定済みか確認
2. Admin 側でコレクションが登録済みか確認（未登録なら `/setup/03_schema` を先に）
3. `cmx/site-config.md` と `workflows/style-guide.md` を読み、トーン・スタイルに合った記事を生成する

## 2つのユースケース

### A. テストデータ投入（新規サイト）

初期構築時に表示確認用の記事を作成する。詳細は [references/seed-patterns.md](references/seed-patterns.md) を参照。

### B. サイト移行（既存コンテンツ取り込み）

既存サイトのページをスクレイピング → MDX に変換 → Admin API で投入。詳細は [references/migration-patterns.md](references/migration-patterns.md) を参照。

## ステータス運用ルール

コンテンツ作成後のステータスは、タスクの性質に応じて使い分ける。**明示的に「公開して」と指示されない限り、公開（publish）は行わない。**

| タスクの性質 | 保存先ステータス | 例 |
|------------|----------------|-----|
| 案出し・探索的なタスク | **draft**（下書き） | 「いくつか記事のアイデアを出して」「テスト記事を作って」 |
| タスク内で記事作成が完結する場合 | **review**（レビュー依頼） | 「新しく記事を作成して」「移行記事を投入して」 |
| ユーザーが明示的に公開を指示した場合のみ | **published**（公開） | 「公開して」「publishして」 |

## Admin API でのコンテンツ作成

SDK API エンドポイント: `POST /api/v1/sdk/manage/contents`

```typescript
const response = await fetch(`${CMX_API_URL}/api/v1/sdk/manage/contents`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CMX_API_KEY}`,
  },
  body: JSON.stringify({
    title: "記事タイトル",
    slug: "article-slug",
    description: "記事の説明文",
    mdx: "# 見出し\n\n本文...",
    collectionId: "コレクションのUUID",
  }),
})
// → { id: "uuid", slug: "article-slug" }
// 初期ステータスは draft
```

### レビューに送る場合（タスク完結時）

```typescript
// draft → review
await fetch(`${CMX_API_URL}/api/v1/sdk/manage/contents/${contentId}/request-review`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${CMX_API_KEY}` },
})
```

### 公開する場合（ユーザーが明示的に指示した場合のみ）

公開には `review` ステータスが前提です。まだ `draft` の場合は `request-review` を先に実行してください。

```typescript
// review → published
await fetch(`${CMX_API_URL}/api/v1/sdk/manage/contents/${contentId}/publish`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${CMX_API_KEY}` },
})
```

> **注意**: `publish` は `review` ステータスのコンテンツにのみ実行可能です。`draft` から直接 `publish` することはできません。

### コレクション ID の取得

```typescript
const res = await fetch(`${CMX_API_URL}/api/v1/sdk/manage/collections`, {
  headers: { "Authorization": `Bearer ${CMX_API_KEY}` },
})
const { collections } = await res.json()
// collections[].id でコレクションUUIDを取得
```

## データタイプのテストデータ

### グローバルデータタイプ（公開サイトに直接表示）

公開サイトに直接表示されるデータタイプ（スタッフ、商品、店舗等）のエントリを作成する場合、`published` フィールドを `true` に設定する必要があります（デフォルトは `false`）。

```bash
# 例: スタッフ情報のエントリを作成（published: true で公開）
npx cmx-sdk create-data-entry --type-slug staff --json '{"name":"山田太郎","role":"エンジニア","published":true}'

# 例: 店舗情報のエントリを作成（published: true で公開）
npx cmx-sdk create-data-entry --type-slug locations --json '{"name":"東京オフィス","address":"東京都渋谷区...","published":true}'

# カスタム: 商品情報のエントリを作成
npx cmx-sdk create-data-entry --type-slug products --json '{"name":"商品A","price":1000,"published":true}'
```

**重要:** `published: false` または未設定の場合、Public API では取得できません。

### コレクション付属データタイプ（カテゴリ・タグ等）

コレクションに付属データタイプ（カテゴリ・タグ等）がある場合、エントリ作成→コンテンツへの参照設定が必要。

#### 1. 付属データタイプのエントリ作成

```bash
# コレクションの付属データタイプを確認
npx cmx-sdk list-collection-data-types --collection blog

# カテゴリエントリを作成
npx cmx-sdk create-data-entry --type-slug blog-categories --json '{"name":"技術ブログ","description":"テック系の記事"}'
npx cmx-sdk create-data-entry --type-slug blog-categories --json '{"name":"デザイン","description":"デザイン系の記事"}'

# タグエントリを作成
npx cmx-sdk create-data-entry --type-slug blog-tags --json '{"name":"Next.js"}'
npx cmx-sdk create-data-entry --type-slug blog-tags --json '{"name":"TypeScript"}'
```

#### 2. コンテンツに参照を設定

コンテンツ作成後、SDK API で参照を設定:

```typescript
// PUT /api/v1/sdk/manage/contents/{contentId}/references
await fetch(`${CMX_API_URL}/api/v1/sdk/manage/contents/${contentId}/references`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CMX_API_KEY}`,
  },
  body: JSON.stringify({
    references: [
      { fieldSlug: "categories", dataEntryIds: ["カテゴリエントリのUUID"] },
      { fieldSlug: "tags", dataEntryIds: ["タグ1のUUID", "タグ2のUUID"] },
    ],
  }),
})
```

## 変更後

1. Admin の投稿一覧で記事が作成されていることを確認
2. フロントの開発サーバーで記事が表示されることを確認
3. テストデータは確認後に削除可能（Admin の投稿一覧から）
