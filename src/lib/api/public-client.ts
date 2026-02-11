import {
  getCollectionContents,
  getCollectionContentDetail,
} from "./admin-client"

// 型はcmx-sdkから再エクスポート
export type {
  PublicCollectionInfo,
  CollectionContentsResponse as ContentsListResponse,
  CollectionContentDetailResponse as ContentDetailResponse,
  PublicContentListItem,
  PublicContentDetail,
  ContentReference,
  AssetReference,
  References,
} from "cmx-sdk"

import type {
  CollectionContentsResponse as ContentsListResponse,
  CollectionContentDetailResponse as ContentDetailResponse,
} from "cmx-sdk"

// ============================================
// API Client Functions (Admin API経由)
// ============================================

/**
 * 公開記事一覧を取得
 */
export async function fetchPublishedContents(
  collectionSlug: string
): Promise<ContentsListResponse | null> {
  try {
    const data = await getCollectionContents(collectionSlug)
    return data as ContentsListResponse
  } catch (error) {
    console.error("Error fetching contents:", error)
    return null
  }
}

/**
 * 公開コンテンツ詳細を取得
 */
export async function fetchPublishedContent(
  collectionSlug: string,
  contentSlug: string
): Promise<ContentDetailResponse | null> {
  try {
    const data = await getCollectionContentDetail(collectionSlug, contentSlug)
    return data as ContentDetailResponse
  } catch (error) {
    console.error("Error fetching content:", error)
    return null
  }
}
