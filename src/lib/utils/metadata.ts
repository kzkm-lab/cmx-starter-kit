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

  return {
    title: `${data.collection.name} | CMX`,
    description:
      data.collection.description || `${data.collection.name}のコンテンツ一覧`,
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

  return {
    title: `${data.content.title} | ${data.collection.name} | CMX`,
    description: data.content.description || undefined,
  }
}
