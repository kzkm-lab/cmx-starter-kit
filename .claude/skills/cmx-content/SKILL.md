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

## Admin API でのコンテンツ作成

Admin API エンドポイント: `POST /api/v1/admin/posts`

```typescript
const response = await fetch(`${CMX_API_URL}/api/v1/admin/posts`, {
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

### 公開する場合

```typescript
await fetch(`${CMX_API_URL}/api/v1/admin/posts/${postId}/publish`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${CMX_API_KEY}` },
})
```

### コレクション ID の取得

```typescript
const res = await fetch(`${CMX_API_URL}/api/v1/admin/collections`, {
  headers: { "Authorization": `Bearer ${CMX_API_KEY}` },
})
const { collections } = await res.json()
// collections[].id でコレクションUUIDを取得
```

## 変更後

1. Admin の投稿一覧で記事が作成されていることを確認
2. フロントの開発サーバーで記事が表示されることを確認
3. テストデータは確認後に削除可能（Admin の投稿一覧から）
