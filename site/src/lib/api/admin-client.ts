/**
 * Admin API Client
 * Re-exports convenience functions from cmx-sdk.
 */

export {
  getCollectionContents,
  getCollectionContentDetail,
  getDataEntries,
  getDataEntry,
  getPreviewByToken,
} from "cmx-sdk"

// Cache tags and fetch utilities
export { CACHE_TAGS, sdkFetchWithTags } from "cmx-sdk"

export type {
  CollectionContentsResponse,
  CollectionContentDetailResponse,
  DataListResponse,
  DataEntryItem,
  PreviewResponse,
  PublicCollectionInfo,
  PublicContentListItem,
  PublicContentDetail,
} from "cmx-sdk"
