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
  publicFetchWithTags,
} from "cmx-sdk"

export type {
  CollectionPostsResponse,
  CollectionPostDetailResponse,
  DataListResponse,
  DataEntryItem,
  PreviewResponse,
  PublicCollectionInfo as CollectionInfo,
  PublicPostListItem as PostListItem,
  PublicPostDetail as PostDetail,
} from "cmx-sdk"
