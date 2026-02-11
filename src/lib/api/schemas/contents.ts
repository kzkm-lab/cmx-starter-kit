import { z } from "zod"
import { slugSchema, uuidSchema } from "./common"

// ============================================
// Content Status
// ============================================

export const contentStatusSchema = z.enum(["plan", "draft", "review", "published", "archived"])
export type ContentStatus = z.infer<typeof contentStatusSchema>

// ============================================
// リクエストスキーマ
// ============================================

/**
 * コンテンツ作成リクエスト
 */
export const createContentRequestSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, "タイトルは必須です").max(500),
  description: z.string().optional(),
  mdx: z.string().optional(),
  collectionId: uuidSchema.optional(),
  status: contentStatusSchema.optional(),
})

export type CreateContentRequest = z.infer<typeof createContentRequestSchema>

/**
 * コンテンツ更新リクエスト
 */
export const updateContentRequestSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  mdx: z.string().optional(),
  status: contentStatusSchema.optional(),
  parentId: uuidSchema.nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export type UpdateContentRequest = z.infer<typeof updateContentRequestSchema>

// ============================================
// レスポンススキーマ
// ============================================

/**
 * コンテンツレスポンス（単体）
 */
export const contentResponseSchema = z.object({
  id: uuidSchema,
  collectionId: uuidSchema.nullable(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  mdx: z.string(),
  frontmatterJson: z.record(z.string(), z.unknown()).nullable(),
  parentId: uuidSchema.nullable(),
  sortOrder: z.number(),
  locale: z.string(),
  status: contentStatusSchema,
  publishedRevisionId: uuidSchema.nullable(),
  publishedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type ContentResponse = z.infer<typeof contentResponseSchema>

/**
 * コンテンツ一覧レスポンス（簡易）
 */
export const contentListItemSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
  title: z.string(),
  status: contentStatusSchema,
  collectionId: uuidSchema.nullable(),
  publishedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
})

export type ContentListItem = z.infer<typeof contentListItemSchema>

/**
 * コンテンツ作成成功レスポンス
 */
export const createContentResponseSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
})

export type CreateContentResponse = z.infer<typeof createContentResponseSchema>
