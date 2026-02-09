# SEO 実装パターン

## generateMetadata — 静的ページ

```tsx
// src/app/about/page.tsx
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export const metadata: Metadata = {
  title: "会社概要 | サイト名",
  description: "会社概要ページの説明文",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "会社概要 | サイト名",
    description: "会社概要ページの説明文",
    url: `${SITE_URL}/about`,
    images: ["/og-default.jpg"],
  },
}
```

## generateMetadata — 動的ページ（記事詳細）

`src/lib/utils/metadata.ts` を拡張:

```tsx
import type { Metadata } from "next"
import { fetchPublishedContent } from "@/lib/api/public-client"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export async function generatePostMetadata(
  collectionSlug: string,
  postSlug: string
): Promise<Metadata> {
  const data = await fetchPublishedContent(collectionSlug, postSlug)
  if (!data) {
    throw new Error(`Failed to fetch post metadata: ${collectionSlug}/${postSlug}`)
  }

  const url = `${SITE_URL}/${collectionSlug}/${postSlug}`
  const title = `${data.post.title} | ${data.collection.name}`
  const description = data.post.description || undefined
  const image = data.post.featuredImage || "/og-default.jpg"

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: data.post.title,
      description,
      url,
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: data.post.title,
      description,
      images: [image],
    },
  }
}
```

## sitemap.ts

```tsx
// src/app/sitemap.ts
import type { MetadataRoute } from "next"
import { getCollectionPosts } from "@/lib/api/public-client"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ]

  // 静的ページ
  const staticPages = ["/about", "/contact"]
  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page}`,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  }

  // 各コレクションの記事を取得
  for (const slug of Object.values(COLLECTION_SLUGS)) {
    // コレクション一覧ページ
    entries.push({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    })

    // 各記事
    try {
      const data = await getCollectionPosts(slug)
      if (data?.posts) {
        for (const post of data.posts) {
          entries.push({
            url: `${SITE_URL}/${slug}/${post.slug}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: "weekly",
            priority: 0.7,
          })
        }
      }
    } catch {
      // コレクション取得失敗時はスキップ
    }
  }

  return entries
}
```

## robots.ts

```tsx
// src/app/robots.ts
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/preview/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

## JSON-LD 構造化データ

### ブログ記事

```tsx
// src/app/blog/[slug]/page.tsx 内
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

function BlogPostJsonLd({ post, collectionSlug }: {
  post: { title: string; description?: string; publishedAt: string; updatedAt: string; featuredImage?: string }
  collectionSlug: string
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage,
    url: `${SITE_URL}/${collectionSlug}/${post.title}`,
    publisher: {
      "@type": "Organization",
      name: "サイト名", // site-config.md のサイト名を使用
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### 組織情報（ルートレイアウト）

```tsx
// src/app/layout.tsx に追加
function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "サイト名",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

## コレクションタイプ別の JSON-LD スキーマタイプ

| コレクションタイプ | schema.org @type |
|------------------|------------------|
| post（ブログ） | BlogPosting |
| news（ニュース） | NewsArticle |
| page（ページ） | WebPage |
| doc（ドキュメント） | TechArticle |
