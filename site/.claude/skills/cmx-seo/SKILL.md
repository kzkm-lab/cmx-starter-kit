---
name: cmx-seo
description: |
  CMX Starter Kit の SEO・メタデータ実装スキル。generateMetadata、OGP、sitemap.ts、robots.ts、JSON-LD 構造化データのパターン。
  トリガー: 「SEOを設定」「メタデータを追加」「OGPを設定」「サイトマップを作成」
  「robots.txtを設定」「構造化データを追加」「JSON-LDを追加」「検索対策」
  「Twitterカードを設定」「og:imageを設定」「canonical URLを設定」など。
---

# CMX SEO・メタデータ

## 事前確認

`cmx/site-config.md` のサイト名・説明を確認し、メタデータに反映する。

## 環境変数

`NEXT_PUBLIC_SITE_URL` — サイトの本番 URL。sitemap・canonical・OGP の URL 構築に必須。`.env.local` で設定済みか確認。

## 既存ユーティリティ

`src/lib/utils/metadata.ts` に `generateCollectionMetadata` / `generatePostMetadata` ヘルパーが存在。拡張する場合はこのファイルを修正。

## パターン別ガイド

各パターンの詳細コードは [references/seo-patterns.md](references/seo-patterns.md) を参照。

### generateMetadata

- **静的ページ**: `export const metadata: Metadata` で直接定義
- **動的ページ**: `export async function generateMetadata()` で CMX API からデータ取得
- **プレビューページ**: `robots: { index: false, follow: false }` を必ず設定

### OGP / Twitter Card

`metadata.ts` の既存ヘルパーを拡張し、`openGraph` と `twitter` フィールドを追加する。デフォルト OG 画像は `/public/og-default.jpg` に配置。

### sitemap.ts

`src/app/sitemap.ts` を作成。CMX API から全コレクションの記事を取得し動的生成。

### robots.ts

`src/app/robots.ts` を作成。`/preview/` と `/api/` を disallow。

### JSON-LD 構造化データ

記事詳細ページに `<script type="application/ld+json">` を埋め込む。スキーマタイプは `BlogPosting`（ブログ）、`NewsArticle`（ニュース）、`WebPage`（その他）。

## 変更後

1. 各ページの `<head>` 出力を確認（ブラウザの DevTools）
2. OGP デバッガー（Facebook Sharing Debugger 等）で確認
3. Google Rich Results Test で JSON-LD を検証
