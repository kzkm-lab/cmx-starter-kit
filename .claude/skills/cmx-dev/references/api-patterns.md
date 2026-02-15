# CMX SDK API リファレンス

## コンテンツ取得関数

### getCollectionContents(slug)

コレクションの公開記事一覧を取得。

```tsx
import { getCollectionContents } from "@/lib/api/admin-client"
// または直接: import { getCollectionContents } from "cmx-sdk"

const data = await getCollectionContents("blog")
// data.collection: { name, slug, description }
// data.contents: Array<{ id, title, slug, description, publishedAt, status }>
```

### getCollectionContentDetail(collectionSlug, contentSlug)

記事の詳細とMDX本文・リファレンスを取得。

```tsx
import { getCollectionContentDetail } from "@/lib/api/admin-client"

const data = await getCollectionContentDetail("blog", "my-post")
// data.collection: { name, slug }
// data.content: { id, title, slug, description, mdx, publishedAt, ... }
// data.references: { contents: {...}, assets: {...} }
```

### getDataEntries(typeSlug, options?)

データ型のエントリ一覧を取得。

```tsx
import { getDataEntries } from "@/lib/api/admin-client"

const data = await getDataEntries("team-members", {
  sortBy: "createdAt",    // ソートフィールド
  sortOrder: "desc",       // "asc" | "desc"
  limit: 10,               // 取得件数
})
// data.items: Array<{ id, ...フィールド }>
```

### getDataEntry(typeSlug, id)

データ型の単一エントリを取得。

```tsx
import { getDataEntry } from "@/lib/api/admin-client"

const entry = await getDataEntry("team-members", "entry-uuid")
```

### getPreviewByToken(token)

プレビュートークンでコンテンツを取得（認証不要）。

```tsx
import { getPreviewByToken } from "@/lib/api/admin-client"

const data = await getPreviewByToken(token)
if (data) {
  // data.content: { title, mdx, status, environment, ... }
  // data.collection: { name, slug }
  // data.references: { contents, assets }
}
```

## ラッパー関数

`src/lib/utils/data-fetching.ts` のヘルパー。失敗時にエラーをthrowする。

```tsx
import {
  requireFetchPosts,     // getCollectionContents のラッパー
  requireFetchContent,   // getCollectionContentDetail のラッパー
  requireDataEntries,    // getDataEntries のラッパー
} from "@/lib/utils/data-fetching"

// 失敗時は Error をthrow（ページレベルでcatch）
const { collection, contents } = await requireFetchPosts("blog")
const { content, references } = await requireFetchContent("blog", "my-post")
const { items } = await requireDataEntries("faq")
```

## MDXレンダリング

```tsx
import { renderMdx } from "@/lib/mdx/render"

// references はAPI応答から取得したもの
const { content } = await renderMdx(item.mdx, references)

// content はReactElement → JSXに直接埋め込み可能
<div className="prose prose-lg max-w-none">{content}</div>
```

`renderMdx` は内部で `src/components/custom/index.ts` の全エクスポートを自動注入する。

## コレクション付属データタイプ API

### コレクションのデータタイプ一覧（SDK API）

```
GET /api/v1/sdk/manage/collections/{slug}/data-types
```

### コレクションにデータタイプを追加（SDK API）

```
POST /api/v1/sdk/manage/collections/{slug}/data-types
Body: { "presetSlug": "categories" }  // プリセットから追加
Body: { "slug": "custom", "name": "カスタム", "referenceType": "single", "fields": [...] }  // カスタム
```

### コレクションからデータタイプを削除（SDK API）

```
DELETE /api/v1/sdk/manage/collections/{slug}/data-types/{dtSlug}
```

### プリセット一覧（SDK API）

```
GET /api/v1/sdk/manage/collection-presets?type=post
→ { "recommended": [...], "others": [...] }
```

### コンテンツの参照取得/設定（SDK API）

```
GET  /api/v1/sdk/manage/contents/{id}/references
PUT  /api/v1/sdk/manage/contents/{id}/references
Body: { "references": [{ "fieldSlug": "categories", "dataEntryIds": ["uuid"] }] }
```

### MCP API（AI向け）

```
GET /api/mcp/collections/{slug}/data-types                    # データタイプ一覧
GET /api/mcp/collections/{slug}/data-types/{dtSlug}/entries   # エントリ一覧
GET /api/mcp/collection-presets?type=post                     # プリセット一覧
```

## キャッシュタグ

Next.js のオンデマンド再検証用:

```tsx
import { CACHE_TAGS } from "@/lib/api/admin-client"
import { revalidateTag } from "next/cache"

CACHE_TAGS.collections           // 全コレクション
CACHE_TAGS.collection("blog")    // 特定コレクション
CACHE_TAGS.content("blog", "slug") // 特定記事
CACHE_TAGS.data                  // 全データ型
CACHE_TAGS.dataType("faq")       // 特定データ型

// 再検証
revalidateTag(CACHE_TAGS.collection("blog"))
```

## メタデータ生成

```tsx
import {
  generateCollectionMetadata,  // 一覧ページ用
  generatePostMetadata,        // 詳細ページ用
} from "@/lib/utils/metadata"

// 一覧ページ
export async function generateMetadata() {
  return generateCollectionMetadata("blog")
  // → { title: "ブログ | CMX", description: "..." }
}

// 詳細ページ
export async function generateMetadata({ params }) {
  const { slug } = await params
  return generatePostMetadata("blog", slug)
  // → { title: "記事タイトル | ブログ | CMX", description: "..." }
}
```

## 型インポート

```tsx
import type {
  CollectionContentsResponse,
  CollectionContentDetailResponse,
  DataListResponse,
  DataEntryItem,
  PreviewResponse,
  References,
} from "cmx-sdk"

// エイリアス（admin-client.ts で定義済み）
import type {
  CollectionInfo,   // PublicCollectionInfo のエイリアス
  ContentListItem,  // PublicContentListItem のエイリアス
  ContentDetail,    // PublicContentDetail のエイリアス
} from "@/lib/api/admin-client"
```
