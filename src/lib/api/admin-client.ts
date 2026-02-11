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
} from "cmx-sdk"

// Cache tags and fetch utilities from @cmx/api-client
export { CACHE_TAGS, sdkFetchWithTags } from "@cmx/api-client/core"

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
