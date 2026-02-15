# サイト移行パターン

## 移行フロー

```
1. 既存サイトの URL 一覧を取得（sitemap.xml or 手動リスト）
2. 各ページをスクレイピングしてコンテンツを取得
3. HTML → MDX に変換
4. Admin API で draft として投入
5. 内容を確認・調整
6. 問題なければ publish
```

## ステップ 1: URL 一覧の取得

### sitemap.xml から

```typescript
const sitemapUrl = "https://old-site.com/sitemap.xml"
const response = await fetch(sitemapUrl)
const xml = await response.text()
// XML をパースして <loc> タグから URL を抽出
```

### 手動リスト

ユーザーに URL リストを提供してもらう。

## ステップ 2: スクレイピング

```typescript
const response = await fetch(url)
const html = await response.text()
// HTML をパースして記事コンテンツを抽出
```

**抽出対象:**
- タイトル（`<h1>` or `<title>`）
- 本文（`<article>` or `<main>` 内のコンテンツ）
- メタ説明文（`<meta name="description">`）
- 公開日（`<time>` or meta タグ）
- アイキャッチ画像（OG image or 最初の画像）

## ステップ 3: HTML → MDX 変換

### 基本変換ルール

| HTML | MDX |
|------|-----|
| `<h2>` | `## ` |
| `<h3>` | `### ` |
| `<p>` | そのまま（タグ除去） |
| `<strong>` | `**テキスト**` |
| `<em>` | `*テキスト*` |
| `<a href="url">` | `[テキスト](url)` |
| `<ul><li>` | `- テキスト` |
| `<ol><li>` | `1. テキスト` |
| `<blockquote>` | `> テキスト` |
| `<code>` | `` `テキスト` `` |
| `<pre><code>` | ` ```lang\nコード\n``` ` |
| `<img>` | `![alt](src)` |
| `<table>` | Markdown テーブル |

### 注意点

- `<script>`, `<style>`, `<iframe>` は除去
- クラス名・ID は除去
- インライン style は除去
- 相対 URL は絶対 URL に変換
- 画像は外部 URL のまま（後で Admin にアップロード可能）

## ステップ 4: SDK API で投入

```typescript
for (const page of convertedPages) {
  const response = await fetch(`${CMX_API_URL}/api/v1/sdk/manage/contents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CMX_API_KEY}`,
    },
    body: JSON.stringify({
      title: page.title,
      slug: page.slug,
      description: page.description,
      mdx: page.mdx,
      collectionId: page.collectionId,
    }),
  })
  const { id } = await response.json()
  console.log(`Created: ${page.title} (${id})`)
}
```

## ステップ 5: 確認・調整

- Admin の投稿一覧で全記事が作成されていることを確認
- プレビューで MDX のレンダリングを確認
- 変換エラー（崩れたテーブル、欠落した画像等）を手動修正

## コレクションの振り分け

移行元のページ構造に応じて振り分ける:

| 移行元 | 振り分け先 |
|--------|-----------|
| ブログ記事 | post タイプのコレクション |
| ニュース・お知らせ | news タイプのコレクション |
| 固定ページ（会社概要等） | page タイプのコレクション |
| ヘルプ・ドキュメント | doc タイプのコレクション |

## slug の生成

移行元の URL パスから生成:

- `https://old-site.com/blog/2024/01/my-article` → `my-article`
- 日本語 URL の場合はローマ字化 or 英語に変換
- 重複チェック: `search_posts` で既存 slug と衝突しないか確認
