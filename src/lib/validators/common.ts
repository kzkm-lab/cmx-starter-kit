import { z } from "zod"

// ============================================
// Patterns
// ============================================

/**
 * スラッグ: 英小文字で始まり、英小文字・数字・ハイフンのみ
 */
export const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/

/**
 * フィールドキー: 英字で始まり、英数字とアンダースコアのみ
 */
export const FIELD_KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/

// ============================================
// Validation Functions
// ============================================

/**
 * スラッグ形式を検証
 */
export function validateSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

/**
 * フィールドキー形式を検証
 */
export function validateFieldKey(key: string): boolean {
  return FIELD_KEY_PATTERN.test(key)
}

// ============================================
// Zod Schemas
// ============================================

/**
 * スラッグスキーマ
 */
export const slugSchema = z
  .string()
  .min(1, "スラッグは必須です")
  .max(255, "スラッグは255文字以内で入力してください")
  .regex(SLUG_PATTERN, "スラッグは英小文字で始まり、英小文字、数字、ハイフンのみ使用できます")

/**
 * UUIDスキーマ
 */
export const uuidSchema = z.string().uuid("有効なUUIDを指定してください")

/**
 * フィールドキースキーマ
 */
export const fieldKeySchema = z
  .string()
  .min(1, "フィールドキーは必須です")
  .regex(FIELD_KEY_PATTERN, "フィールドキーは英字で始まり、英数字とアンダースコアのみ使用できます")

/**
 * 空でない文字列
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, "この項目は必須です")

/**
 * オプショナルな文字列（空文字はnullに変換）
 */
export const optionalStringSchema = z
  .string()
  .optional()
  .transform((val) => (val === "" ? null : val))
