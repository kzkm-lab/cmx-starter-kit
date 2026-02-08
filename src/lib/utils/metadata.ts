import type { Metadata } from "next"
import { fetchPublishedPosts, fetchPublishedContent } from "@/lib/api/public-client"

/**
 * Generate metadata for a collection list page
 */
export async function generateCollectionMetadata(
  collectionSlug: string
): Promise<Metadata> {
  const data = await fetchPublishedPosts(collectionSlug)
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
 * Generate metadata for a post detail page
 */
export async function generatePostMetadata(
  collectionSlug: string,
  postSlug: string
): Promise<Metadata> {
  const data = await fetchPublishedContent(collectionSlug, postSlug)
  if (!data) {
    throw new Error(`Failed to fetch post metadata: ${collectionSlug}/${postSlug}`)
  }

  return {
    title: `${data.post.title} | ${data.collection.name} | CMX`,
    description: data.post.description || undefined,
  }
}
