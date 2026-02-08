import { z } from "zod"
import { slugSchema, uuidSchema, fieldKeySchema } from "./common"

// ============================================
// Field Type
// ============================================

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "richtext",
  "number",
  "date",
  "datetime",
  "boolean",
  "select",
  "image",
  "url",
  "email",
  "relation",
])

export type FieldType = z.infer<typeof fieldTypeSchema>

// ============================================
// Field Options
// ============================================

/**
 * フィールドタイプ固有のオプション
 */
export const fieldOptionsSchema = z.object({
  // text, textarea
  maxLength: z.number().int().positive().optional(),
  placeholder: z.string().optional(),

  // number
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),

  // select
  choices: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  multiple: z.boolean().optional(),

  // relation
  targetType: z.string().optional(),

  // image
  allowedTypes: z.array(z.string()).optional(),
})

export type FieldOptions = z.infer<typeof fieldOptionsSchema>

// ============================================
// Field Definition
// ============================================

/**
 * フィールド定義
 */
export const fieldDefinitionSchema = z.object({
  key: fieldKeySchema,
  type: fieldTypeSchema,
  label: z.string().min(1, "ラベルは必須です"),
  required: z.boolean(),
  description: z.string().optional(),
  options: fieldOptionsSchema.optional(),
})

export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>

// ============================================
// Data Type Config
// ============================================

/**
 * データタイプ設定
 */
export const dataTypeConfigSchema = z.object({
  icon: z.string().optional(),
  listDisplayFields: z.array(z.string()).optional(),
  titleField: z.string().optional(),
})

export type DataTypeConfig = z.infer<typeof dataTypeConfigSchema>

// ============================================
// リクエストスキーマ
// ============================================

/**
 * データタイプ作成リクエスト
 */
export const createDataTypeRequestSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "名前は必須です").max(255),
  description: z.string().optional(),
  fieldsJson: z.array(fieldDefinitionSchema).optional(),
  configJson: dataTypeConfigSchema.optional(),
})

export type CreateDataTypeRequest = z.infer<typeof createDataTypeRequestSchema>

/**
 * データタイプ更新リクエスト
 */
export const updateDataTypeRequestSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  fieldsJson: z.array(fieldDefinitionSchema).optional(),
  configJson: dataTypeConfigSchema.nullable().optional(),
})

export type UpdateDataTypeRequest = z.infer<typeof updateDataTypeRequestSchema>

// ============================================
// レスポンススキーマ
// ============================================

/**
 * データタイプレスポンス
 */
export const dataTypeResponseSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  fieldsJson: z.array(fieldDefinitionSchema),
  configJson: dataTypeConfigSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type DataTypeResponse = z.infer<typeof dataTypeResponseSchema>

/**
 * データタイプ一覧アイテム
 */
export const dataTypeListItemSchema = z.object({
  id: uuidSchema,
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  fieldCount: z.number().optional(),
})

export type DataTypeListItem = z.infer<typeof dataTypeListItemSchema>
