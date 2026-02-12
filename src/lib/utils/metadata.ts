import type { Metadata } from "next"
import { fetchPublishedContents, fetchPublishedContent } from "@/lib/api/public-client"

/**
 * Generate metadata for a collection list page
 */
export async function generateCollectionMetadata(
  collectionSlug: string
): Promise<Metadata> {
  const data = await fetchPublishedContents(collectionSlug)
  if (!data) {
    throw new Error(`Failed to fetch collection metadata: ${collectionSlug}`)
  }

  const title = data.collection.name
  const description =
    data.collection.description || `${data.collection.name}のコンテンツ一覧`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${collectionSlug}`,
    },
  }
}

/**
 * Generate metadata for a content detail page
 */
export async function generateContentMetadata(
  collectionSlug: string,
  contentSlug: string
): Promise<Metadata> {
  const data = await fetchPublishedContent(collectionSlug, contentSlug)
  if (!data) {
    throw new Error(`Failed to fetch content metadata: ${collectionSlug}/${contentSlug}`)
  }

  const title = `${data.content.title} | ${data.collection.name}`
  const description = data.content.description || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/${collectionSlug}/${contentSlug}`,
      ...(data.content.publishedAt && {
        publishedTime: data.content.publishedAt,
      }),
    },
  }
}
