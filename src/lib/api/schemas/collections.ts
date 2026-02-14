import { z } from "zod"
import { slugSchema, uuidSchema } from "./common"

// ============================================
// Content Type
// ============================================

export const contentTypeSchema = z.enum(["post", "page", "doc", "news"])
export type ContentType = z.infer<typeof contentTypeSchema>

// ============================================
// Collection Config
// ============================================

export const collectionConfigSchema = z.object({
  maxDepth: z.number().int().min(0).optional(),
  requiredFields: z.array(z.string()).optional(),
  defaults: z.record(z.string(), z.unknown()).optional(),
})

export type CollectionConfig = z.infer<typeof collectionConfigSchema>

// ============================================
// リクエストスキーマ
// ============================================

/**
 * コレクション作成リクエスト
 */
export const createCollectionRequestSchema = z.object({
  type: contentTypeSchema,
  slug: slugSchema,
  name: z.string().min(1, "名前は必須です").max(255),
  description: z.string().optional(),
  configJson: collectionConfigSchema.optional(),
})

export type CreateCollectionRequest = z.infer<typeof createCollectionRequestSchema>

/**
 * コレクション更新リクエスト
 */
export const updateCollectionRequestSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  configJson: collectionConfigSchema.nullable().optional(),
})

export type UpdateCollectionRequest = z.infer<typeof updateCollectionRequestSchema>

// ============================================
// レスポンススキーマ
// ============================================

/**
 * コレクションレスポンス
 */
export const collectionResponseSchema = z.object({
  id: uuidSchema,
  type: contentTypeSchema,
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  configJson: collectionConfigSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  contentCount: z.number().optional(),
})

export type CollectionResponse = z.infer<typeof collectionResponseSchema>

/**
 * コレクション一覧アイテム
 */
export const collectionListItemSchema = z.object({
  id: uuidSchema,
  type: contentTypeSchema,
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  contentCount: z.number(),
})

export type CollectionListItem = z.infer<typeof collectionListItemSchema>
