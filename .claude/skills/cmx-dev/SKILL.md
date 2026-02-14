---
name: cmx-dev
description: |
  CMX Starter Kitの開発ガイド。cmx-sdkを使ったページ作成、データ取得、MDXレンダリング、コード生成を支援。
  トリガー: 「ページを追加」「ブログページを作りたい」「データを表示」「コレクションページ」
  「データ型のページ」「MDXをレンダリング」「型を生成」「npx cmx-sdk generate」
  「CMXからデータを取得」「新しいルートを作成」「プレビューページ」など。
---

# CMX Starter Kit 開発ガイド

## プロジェクト構成

```
src/
├── app/                          # Next.js App Router ページ
│   ├── blog/page.tsx             # コレクション一覧ページ
│   ├── blog/[slug]/page.tsx      # コレクション記事詳細ページ
│   └── preview/[token]/page.tsx  # プレビューページ
├── components/custom/            # カスタムMDXコンポーネント
├── lib/
│   ├── api/
│   │   ├── admin-client.ts       # cmx-sdk の re-export
│   │   └── public-client.ts      # エラーハンドリング付きラッパー
│   ├── mdx/render.tsx            # MDXレンダリング（カスタムコンポーネント注入）
│   ├── utils/
│   │   ├── data-fetching.ts      # requireFetchPosts, requireFetchContent
│   │   ├── metadata.ts           # generateCollectionMetadata, generatePostMetadata
│   │   └── date.ts               # formatPostDate
│   └── constants/collections.ts  # COLLECTION_SLUGS 定義
```

## タスク判定ツリー

- **コレクション（ブログ/ニュース等）のページを追加** → [コレクションページ作成](#コレクションページ作成)
- **データ型（チームメンバー/FAQ等）のページを追加** → [データ型ページ作成](#データ型ページ作成)
- **静的ページを追加** → [静的ページ作成](#静的ページ作成)
- **型安全なAPIコードを生成** → [コード生成](#コード生成)
- **API関数の詳細を知りたい** → [references/api-patterns.md](references/api-patterns.md) を参照

## コレクションページ作成

CMX Admin で管理されたコレクション（ブログ、ニュース等）のページを作成する。

### 一覧ページ

```tsx
// src/app/{collection}/page.tsx
import type { Metadata } from "next"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchPosts } from "@/lib/utils/data-fetching"
import { generateCollectionMetadata } from "@/lib/utils/metadata"
import { formatPostDate } from "@/lib/utils/date"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return generateCollectionMetadata(COLLECTION_SLUGS.blog)
}

export default async function BlogListPage() {
  const { collection, posts } = await requireFetchPosts(COLLECTION_SLUGS.blog)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{collection.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <a key={post.id} href={`/blog/${post.slug}`}>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            {post.publishedAt && <time>{formatPostDate(post.publishedAt)}</time>}
          </a>
        ))}
      </div>
    </div>
  )
}
```

### 詳細ページ（MDXレンダリング付き）

```tsx
// src/app/{collection}/[slug]/page.tsx
import type { Metadata } from "next"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchContent } from "@/lib/utils/data-fetching"
import { generatePostMetadata } from "@/lib/utils/metadata"
import { renderMdx } from "@/lib/mdx/render"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return generatePostMetadata(COLLECTION_SLUGS.blog, slug)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const { post, references } = await requireFetchContent(COLLECTION_SLUGS.blog, slug)
  const { content } = await renderMdx(post.mdx, references)

  return (
    <article className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="prose prose-lg max-w-none">{content}</div>
      </div>
    </article>
  )
}
```

### 新しいコレクションを追加する際の手順

1. `src/lib/constants/collections.ts` に slug を追加
2. `src/app/{slug}/page.tsx` — 一覧ページ作成
3. `src/app/{slug}/[slug]/page.tsx` — 詳細ページ作成

## データ型ページ作成

CMX Admin で管理されたデータ型（チームメンバー、FAQ等）を表示するページ。

```tsx
// src/app/team/page.tsx
import { getDataEntries } from "@/lib/api/admin-client"

export const dynamic = "force-dynamic"

interface TeamMember {
  id: string
  name?: string
  role?: string
  bio?: string
  image?: string
}

export default async function TeamPage() {
  const data = await getDataEntries("team-members", {
    sortBy: "createdAt",
    sortOrder: "asc",
  })
  if (!data) throw new Error("Failed to fetch team members")
  const members = data.items as unknown as TeamMember[]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">チーム</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {members.map((m) => (
          <div key={m.id} className="text-center">
            <h3 className="font-semibold">{m.name}</h3>
            <p className="text-muted-foreground">{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**型安全にしたい場合:** [コード生成](#コード生成)で型付き関数を生成。

## 静的ページ作成

CMX APIを使わない単純なページ。

```tsx
// src/app/about/page.tsx
export const metadata = {
  title: "About | CMX",
  description: "About us page",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">About</h1>
      <p>Your content here</p>
    </div>
  )
}
```

## コード生成

`cmx-sdk` CLI でワークスペースのスキーマから型付きTypeScript関数を自動生成。

### 実行

```bash
npx cmx-sdk generate                         # デフォルト: cmx/generated/
npx cmx-sdk generate --output src/cmx/generated  # 出力先を指定
```

**前提:** `.env` に `CMX_API_URL` と `CMX_API_KEY` が設定されていること。

### 生成されるもの

```
cmx/generated/
├── index.ts                  # 全エクスポート
├── collections/
│   ├── blog.ts               # getBlogPosts(), getBlogPostDetail()
│   └── news.ts               # getNewsPosts(), getNewsPostDetail()
└── data-types/
    ├── team-members.ts        # TeamMember型, getTeamMembers(), getTeamMemberById()
    └── faq.ts                 # Faq型, getFaqs(), getFaqById()
```

### 使い方

```tsx
// Before（汎用、型なし）
import { getDataEntries } from "cmx-sdk"
const { items } = await getDataEntries("team-members")
// items[0].name は unknown

// After（型付き、自動生成）
import { getTeamMembers, getTeamMemberById } from "./cmx/generated"
const { items } = await getTeamMembers()
// items[0].name は string ✅
const member = await getTeamMemberById("uuid")
// member.name は string ✅
```

### スキーマ変更時

CMX Admin でコレクションやデータ型を変更した場合は再実行:

```bash
npx cmx-sdk generate
```

## 共通パターン

### `export const dynamic = "force-dynamic"`

全てのCMXデータ取得ページに必須。ビルド時にAPIコールが失敗しないようにする。

### MDXレンダリング

常に `src/lib/mdx/render.tsx` の `renderMdx` を使用。カスタムコンポーネントが自動注入される。

```tsx
import { renderMdx } from "@/lib/mdx/render"
const { content } = await renderMdx(post.mdx, references)
// content を JSX として直接レンダリング
```

### メタデータ生成

コレクションページには既存ユーティリティを使用:

```tsx
import { generateCollectionMetadata, generatePostMetadata } from "@/lib/utils/metadata"
```
