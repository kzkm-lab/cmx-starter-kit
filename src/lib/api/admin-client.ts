/**
 * Admin API Client
 * Re-exports convenience functions from cmx-sdk.
 */

export {
  getCollectionPosts,
  getCollectionPostDetail,
  getDataEntries,
  getDataEntry,
  getPreviewByToken,
  CACHE_TAGS,
  sdkFetchWithTags,
} from "cmx-sdk"

export type {
  CollectionPostsResponse,
  CollectionPostDetailResponse,
  DataListResponse,
  DataEntryItem,
  PreviewResponse,
  CollectionInfo,
  PostListItem,
  PostDetail,
} from "cmx-sdk"
