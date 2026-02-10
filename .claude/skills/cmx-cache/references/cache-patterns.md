# キャッシュ実装パターン

## CACHE_TAGS

`@cmx/api-client/core` または `cmx-sdk` からインポート:

```tsx
import { CACHE_TAGS } from "@/lib/api/admin-client"

CACHE_TAGS.collections             // "collections" — 全コレクション
CACHE_TAGS.collection("blog")      // "collection:blog" — 特定コレクション
CACHE_TAGS.post("blog", "hello")   // "post:blog:hello" — 特定記事
CACHE_TAGS.data                    // "data" — 全データタイプ
CACHE_TAGS.dataType("faq")         // "data:faq" — 特定データタイプ
```

## force-dynamic → ISR 移行

### Before（毎リクエスト SSR）

```tsx
// src/app/blog/page.tsx
export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const data = await getCollectionPosts("blog")
  // ...
}
```

### After（ISR + キャッシュタグ）

```tsx
// src/app/blog/page.tsx
import { CACHE_TAGS, sdkFetchWithTags } from "@/lib/api/admin-client"

export const revalidate = 3600 // 1時間

export default async function BlogPage() {
  const data = await sdkFetchWithTags<CollectionPostsResponse>(
    `/sdk/collections/blog/posts`,
    [CACHE_TAGS.collections, CACHE_TAGS.collection("blog")],
    3600
  )
  // ...
}
```

### 記事詳細ページ

```tsx
// src/app/blog/[slug]/page.tsx
import { CACHE_TAGS, sdkFetchWithTags } from "@/lib/api/admin-client"

export const revalidate = 3600

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const data = await sdkFetchWithTags<CollectionPostDetailResponse>(
    `/sdk/collections/blog/posts/${slug}`,
    [CACHE_TAGS.collection("blog"), CACHE_TAGS.post("blog", slug)],
    3600
  )
  // ...
}
```

## 推奨 revalidate 値

| ページ種類 | revalidate | 理由 |
|-----------|-----------|------|
| トップページ | 600（10分） | 新着表示の鮮度 |
| コレクション一覧 | 3600（1時間） | 記事追加は頻繁ではない |
| 記事詳細 | 3600（1時間） | 公開後の修正は稀 |
| データタイプ表示 | 3600（1時間） | 構造データの更新頻度 |
| 静的ページ（about等） | 86400（1日） | ほぼ変わらない |
| プレビュー | force-dynamic | 常に最新が必須 |

## リバリデーション API

### エンドポイント

`POST /api/revalidate`

### 認証

```
X-API-Key: {REVALIDATE_API_KEY}
```

### リクエスト例

```bash
# 特定コレクションのキャッシュを無効化
curl -X POST https://yoursite.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -d '{"tags": ["collection:blog"]}'

# 特定記事のキャッシュを無効化
curl -X POST https://yoursite.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -d '{"tag": "post:blog:hello-world"}'
```

### CMX Admin からの連携

CMX Admin の Webhook 設定でリバリデーション API を呼び出す:

1. Admin の Webhook 設定画面で URL に `https://yoursite.com/api/revalidate` を登録
2. ヘッダーに `X-API-Key` を設定
3. イベント（記事公開・更新・削除）ごとに対応するタグを送信

## Cloudflare R2 キャッシュ構成

### 設定ファイル

`open-next.config.ts`:

```tsx
import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
})
```

### wrangler.jsonc

```jsonc
{
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "my-website-cache"
    }
  ]
}
```

### 環境ごとのバケット

- 本番: `my-website-cache`
- ステージング: `my-website-cache-stg`（`wrangler.jsonc` の `env.stg` で設定）

## 環境変数チェックリスト

| 変数 | 用途 | 必須タイミング |
|------|------|--------------|
| `REVALIDATE_API_KEY` | リバリデーション API の認証キー | ISR 使用時 |
| `NEXT_INC_CACHE_R2_BUCKET`（バインディング） | R2 キャッシュバケット | Cloudflare デプロイ時 |
