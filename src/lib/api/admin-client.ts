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

// Cache tags and fetch utilities from @cmx/api-client
export { CACHE_TAGS, sdkFetchWithTags } from "@cmx/api-client/core"

export type {
  CollectionContentsResponse,
  CollectionContentDetailResponse,
  DataListResponse,
  DataEntryItem,
  PreviewResponse,
  CollectionInfo,
  ContentListItem,
  ContentDetail,
} from "cmx-sdk"
