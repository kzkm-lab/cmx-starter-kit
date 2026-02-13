import { z } from "zod"

// ============================================
// 共通パターン
// ============================================

/**
 * スラッグ: 英小文字で始まり、英小文字・数字・ハイフンのみ
 */
export const slugSchema = z
  .string()
  .min(1, "スラッグは必須です")
  .max(255, "スラッグは255文字以内で入力してください")
  .regex(
    /^[a-z][a-z0-9-]*$/,
    "スラッグは英小文字で始まり、英小文字、数字、ハイフンのみ使用できます"
  )

/**
 * UUID
 */
export const uuidSchema = z.string().uuid("有効なUUIDを指定してください")

/**
 * フィールドキー: 英字で始まり、英数字とアンダースコアのみ
 */
export const fieldKeySchema = z
  .string()
  .min(1, "フィールドキーは必須です")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "フィールドキーは英字で始まり、英数字とアンダースコアのみ使用できます"
  )

// ============================================
// エラーレスポンス
// ============================================

/**
 * APIエラーレスポンス
 */
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.string()).optional(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

// ============================================
// 成功レスポンス
// ============================================

/**
 * 削除成功レスポンス
 */
export const deleteSuccessSchema = z.object({
  success: z.literal(true),
})

export type DeleteSuccess = z.infer<typeof deleteSuccessSchema>

// ============================================
// ページネーション
// ============================================

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
