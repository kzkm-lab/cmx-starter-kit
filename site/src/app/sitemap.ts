import type { MetadataRoute } from "next"
import { getCollectionContents } from "@/lib/api/admin-client"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000"
  const urls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
  ]

  for (const slug of [COLLECTION_SLUGS.blog, COLLECTION_SLUGS.news]) {
    urls.push({ url: `${base}/${slug}`, lastModified: new Date() })

    try {
      const res = await getCollectionContents(slug, { limit: 100 })
      for (const item of res.contents) {
        urls.push({
          url: `${base}/${slug}/${item.slug}`,
          lastModified: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        })
      }
    } catch {
      // コレクション取得失敗時はスキップ
    }
  }

  return urls
}
