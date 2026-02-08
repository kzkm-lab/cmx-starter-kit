import { z } from "zod"
import { slugSchema, uuidSchema } from "./common"

// ============================================
// Post Status
// ============================================

export const postStatusSchema = z.enum(["plan", "draft", "review", "published", "archived"])
export type PostStatus = z.infer<typeof postStatusSchema>

// ============================================
// リクエストスキーマ
// ============================================

/**
 * 投稿作成リクエスト
 */
export const createPostRequestSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, "タイトルは必須です").max(500),
  description: z.string().optional(),
  mdx: z.string().optional(),
  collectionId: uuidSchema.optional(),
  status: postStatusSchema.optional(),
})

export type CreatePostRequest = z.infer<typeof createPostRequestSchema>

/**
 * 投稿更新リクエスト
 */
export const updatePostRequestSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  mdx: z.string().optional(),
  status: postStatusSchema.optional(),
  parentId: uuidSchema.nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>

// ============================================
// レスポンススキーマ
// ============================================

/**
 * 投稿レスポンス（単体）
 */
export const postResponseSchema = z.object({
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
  status: postStatusSchema,
  publishedRevisionId: uuidSchema.nullable(),
  publishedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type PostResponse = z.infer<typeof postResponseSchema>

/**
 * 投稿一覧レスポンス（簡易）
 */
export const postListItemSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
  title: z.string(),
  status: postStatusSchema,
  collectionId: uuidSchema.nullable(),
  publishedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
})

export type PostListItem = z.infer<typeof postListItemSchema>

/**
 * 投稿作成成功レスポンス
 */
export const createPostResponseSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
})

export type CreatePostResponse = z.infer<typeof createPostResponseSchema>
