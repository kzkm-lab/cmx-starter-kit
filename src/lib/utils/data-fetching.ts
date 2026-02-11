import {
  fetchPublishedContents,
  fetchPublishedContent,
} from "@/lib/api/public-client"
import { getDataEntries } from "@/lib/api/admin-client"

/**
 * Fetch collection contents with error throwing on failure
 */
export async function requireFetchContents(collectionSlug: string) {
  const data = await fetchPublishedContents(collectionSlug)
  if (!data) {
    throw new Error(`Failed to fetch collection: ${collectionSlug}`)
  }
  return data
}

/**
 * Fetch content detail with error throwing on failure
 */
export async function requireFetchContent(
  collectionSlug: string,
  contentSlug: string
) {
  const data = await fetchPublishedContent(collectionSlug, contentSlug)
  if (!data) {
    throw new Error(`Failed to fetch content: ${collectionSlug}/${contentSlug}`)
  }
  return data
}

/**
 * Fetch data entries with error throwing on failure
 */
export async function requireDataEntries(
  typeSlug: string,
  options?: { sortBy?: string; sortOrder?: string; limit?: number }
) {
  const data = await getDataEntries(typeSlug, options)
  if (!data) {
    throw new Error(`Failed to fetch data: ${typeSlug}`)
  }
  return data
}
