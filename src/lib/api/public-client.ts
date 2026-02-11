import {
  getCollectionPosts,
  getCollectionPostDetail,
} from "./admin-client"

// 型はcmx-sdkから再エクスポート
export type {
  CollectionInfo,
  CollectionPostsResponse as PostsListResponse,
  CollectionPostDetailResponse as PostDetailResponse,
  PostListItem,
  PostDetail,
  PostReference,
  AssetReference,
  References,
} from "cmx-sdk"

import type {
  CollectionPostsResponse as PostsListResponse,
  CollectionPostDetailResponse as PostDetailResponse,
} from "cmx-sdk"

// ============================================
// API Client Functions (Admin API経由)
// ============================================

/**
 * 公開記事一覧を取得
 */
export async function fetchPublishedPosts(
  collectionSlug: string
): Promise<PostsListResponse | null> {
  try {
    const data = await getCollectionPosts(collectionSlug)
    return data as PostsListResponse
  } catch (error) {
    console.error("Error fetching posts:", error)
    return null
  }
}

/**
 * 公開コンテンツ詳細を取得
 */
export async function fetchPublishedContent(
  collectionSlug: string,
  contentSlug: string
): Promise<PostDetailResponse | null> {
  try {
    const data = await getCollectionPostDetail(collectionSlug, contentSlug)
    return data as PostDetailResponse
  } catch (error) {
    console.error("Error fetching content:", error)
    return null
  }
}
