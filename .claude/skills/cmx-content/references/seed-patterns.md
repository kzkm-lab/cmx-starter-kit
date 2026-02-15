# テストデータ投入パターン

## 投入フロー

```
1. コレクション一覧を取得（Admin API）
2. 各コレクションの type に合わせた記事を生成
3. Admin API で draft として作成
4. request-review でレビューステータスに変更（テストデータ投入はタスク完結型のため）
5. ユーザーが「公開して」と指示した場合のみ publish で公開
6. フロントの開発サーバーで確認
```

> **注意**: `publish` は `review` ステータスからのみ実行可能。`draft` から直接 `publish` はできない。
> **重要**: テストデータ投入はタスク完結型のため `review` まで進める。公開は明示的な指示があった場合のみ。

## コレクション type 別のテスト記事

### post（ブログ）

各コレクションに 2-3 件。異なる長さ・構成の記事を含める。

```markdown
---
title: テスト記事のタイトル
description: SEO用の説明文（120-160文字）
category: "技術ブログ"
tags: ["Next.js", "TypeScript"]
---

## セクション1

本文テキスト。`site-config.md` のトーンに合わせた文体で書く。

## セクション2

リストや画像を含むセクション。

- 箇条書き項目1
- 箇条書き項目2

## まとめ

記事のまとめ。
```

### news（ニュース）

2 件程度。短めの告知文。

### page（固定ページ）

About ページ等があれば 1 件。

### doc（ドキュメント）

ドキュメントがあれば 1 件。親子構造の確認用。

## コレクション付属データタイプのテストデータ

コレクションに付属データタイプがある場合、コンテンツ投入前にエントリを作成し、参照を設定する。

### フロー

```
1. コレクションの付属データタイプ一覧を取得
2. 各データタイプにテストエントリを作成（カテゴリ2-3件、タグ3-5件）
3. コンテンツ作成
4. コンテンツに参照を設定（PUT /contents/:id/references）
5. 表示確認
```

### カテゴリ例

```bash
npx cmx-sdk create-data-entry --type-slug blog-categories --json '{"name":"技術","description":"テック系の記事"}'
npx cmx-sdk create-data-entry --type-slug blog-categories --json '{"name":"デザイン","description":"デザイン系の記事"}'
npx cmx-sdk create-data-entry --type-slug blog-categories --json '{"name":"ビジネス","description":"ビジネス系の記事"}'
```

### タグ例

```bash
npx cmx-sdk create-data-entry --type-slug blog-tags --json '{"name":"Next.js"}'
npx cmx-sdk create-data-entry --type-slug blog-tags --json '{"name":"TypeScript"}'
npx cmx-sdk create-data-entry --type-slug blog-tags --json '{"name":"React"}'
npx cmx-sdk create-data-entry --type-slug blog-tags --json '{"name":"CSS"}'
```

### 参照設定例

テスト記事にカテゴリ1つ + タグ2つを設定:

```typescript
await fetch(`${CMX_API_URL}/api/v1/sdk/manage/contents/${contentId}/references`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CMX_API_KEY}`,
  },
  body: JSON.stringify({
    references: [
      { fieldSlug: "categories", dataEntryIds: [categoryId] },
      { fieldSlug: "tags", dataEntryIds: [tagId1, tagId2] },
    ],
  }),
})
```

## slug の命名規則

テストデータは `test-` プレフィックスを付けると後で判別しやすい:

- `test-first-post`
- `test-long-article`
- `test-news-announcement`

## MDX テンプレート（最小限）

```markdown
## はじめに

この記事はテストデータです。サイトの表示確認用に作成されました。

## 本文

ここに本文が入ります。このセクションでは、テキストのフォーマットや
レイアウトが正しく表示されることを確認します。

**太字テキスト**や`コード`、[リンク](https://example.com)の表示も確認できます。

## まとめ

テストデータの確認が完了したら、Admin の投稿一覧から削除できます。
```

## MDX テンプレート（コンポーネント含む）

登録済みコンポーネントを含むテスト記事。コンポーネントの表示確認用。

```markdown
## コンポーネント表示テスト

<Callout type="info">
これは情報コールアウトのテストです。
</Callout>

<Callout type="warning" title="注意">
これは警告コールアウトのテストです。
</Callout>
```

**注意:** 使用するコンポーネントは `src/components/custom/index.ts` に export されているもののみ。未登録コンポーネントを使うと MDX レンダリングでエラーになる。
