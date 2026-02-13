export const COLLECTION_SLUGS = {
  blog: "blog",
  news: "news",
  pages: "pages",
} as const

export type CollectionSlug = typeof COLLECTION_SLUGS[keyof typeof COLLECTION_SLUGS]
