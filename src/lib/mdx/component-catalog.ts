import { z } from "zod"

// ============================================
// Component Props Schema Definitions
// ============================================

export const componentSchemas = {
  // BlogCard: 他記事への参照
  BlogCard: z.object({
    postId: z.string().uuid().describe("参照先記事のUUID"),
  }),

  // Image: 画像表示
  Image: z.object({
    assetId: z.string().uuid().describe("アセットのUUID"),
    alt: z.string().optional().describe("代替テキスト"),
    size: z
      .enum(["thumbnail", "medium", "large", "original"])
      .default("large")
      .describe("表示サイズ"),
    caption: z.string().optional().describe("キャプション"),
  }),

  // Callout: 注意書きボックス
  Callout: z.object({
    type: z
      .enum(["info", "warning", "error", "success", "tip"])
      .default("info")
      .describe("タイプ"),
    title: z.string().optional().describe("タイトル"),
    children: z.string().describe("本文（Markdown可）"),
  }),

  // CodeBlock: コードブロック
  CodeBlock: z.object({
    language: z.string().default("text").describe("言語"),
    filename: z.string().optional().describe("ファイル名"),
    children: z.string().describe("コード"),
    showLineNumbers: z.boolean().default(false).describe("行番号表示"),
  }),

  // Embed: 外部埋め込み
  Embed: z.object({
    url: z.string().url().describe("埋め込みURL"),
    type: z.enum(["youtube", "twitter", "generic"]).default("generic").describe("タイプ"),
  }),

  // Heading: 見出し（h2-h4のみ許可）
  Heading: z.object({
    level: z.enum(["2", "3", "4"]).describe("見出しレベル"),
    children: z.string().describe("見出しテキスト"),
    id: z.string().optional().describe("アンカーID"),
  }),

  // List: リスト
  List: z.object({
    type: z.enum(["ordered", "unordered"]).default("unordered").describe("リストタイプ"),
    items: z.array(z.string()).describe("リスト項目"),
  }),

  // Table: テーブル
  Table: z.object({
    headers: z.array(z.string()).describe("ヘッダー行"),
    rows: z.array(z.array(z.string())).describe("データ行"),
    caption: z.string().optional().describe("キャプション"),
  }),

  // Quote: 引用
  Quote: z.object({
    children: z.string().describe("引用テキスト"),
    cite: z.string().optional().describe("引用元"),
  }),

  // Divider: 区切り線
  Divider: z.object({}),

  // Button: ボタンリンク
  Button: z.object({
    href: z.string().describe("リンク先URL"),
    children: z.string().describe("ボタンテキスト"),
    variant: z.enum(["primary", "secondary", "outline"]).default("primary").describe("スタイル"),
  }),
} as const

// ============================================
// Component Catalog Type
// ============================================

export type ComponentName = keyof typeof componentSchemas

export interface ComponentDefinition<T extends ComponentName = ComponentName> {
  name: T
  displayName: string
  description: string
  category: "content" | "media" | "reference" | "layout"
  schema: (typeof componentSchemas)[T]
  // AI向けの使用例
  examples: string[]
  // 参照を含むかどうか（postIdやassetIdを持つ）
  hasReferences: boolean
}

// ============================================
// Component Catalog
// ============================================

export const componentCatalog: Record<ComponentName, ComponentDefinition> = {
  BlogCard: {
    name: "BlogCard",
    displayName: "記事カード",
    description: "他の記事へのリンクカードを表示します",
    category: "reference",
    schema: componentSchemas.BlogCard,
    examples: ['<BlogCard postId="123e4567-e89b-12d3-a456-426614174000" />'],
    hasReferences: true,
  },

  Image: {
    name: "Image",
    displayName: "画像",
    description: "アップロード済み画像を表示します",
    category: "media",
    schema: componentSchemas.Image,
    examples: [
      '<Image assetId="123e4567-e89b-12d3-a456-426614174000" alt="説明" />',
      '<Image assetId="123e4567-e89b-12d3-a456-426614174000" size="medium" caption="キャプション" />',
    ],
    hasReferences: true,
  },

  Callout: {
    name: "Callout",
    displayName: "コールアウト",
    description: "注意書きや補足情報を目立たせるボックス",
    category: "content",
    schema: componentSchemas.Callout,
    examples: [
      '<Callout type="info">これは情報です</Callout>',
      '<Callout type="warning" title="注意">重要な注意事項です</Callout>',
    ],
    hasReferences: false,
  },

  CodeBlock: {
    name: "CodeBlock",
    displayName: "コードブロック",
    description: "シンタックスハイライト付きコード表示",
    category: "content",
    schema: componentSchemas.CodeBlock,
    examples: [
      '<CodeBlock language="javascript">const x = 1;</CodeBlock>',
      '<CodeBlock language="typescript" filename="example.ts" showLineNumbers>function hello() {}</CodeBlock>',
    ],
    hasReferences: false,
  },

  Embed: {
    name: "Embed",
    displayName: "埋め込み",
    description: "YouTube動画やツイートを埋め込みます",
    category: "media",
    schema: componentSchemas.Embed,
    examples: [
      '<Embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" type="youtube" />',
      '<Embed url="https://twitter.com/example/status/123456789" type="twitter" />',
    ],
    hasReferences: false,
  },

  Heading: {
    name: "Heading",
    displayName: "見出し",
    description: "セクション見出し（h2-h4）",
    category: "layout",
    schema: componentSchemas.Heading,
    examples: [
      '<Heading level="2">大見出し</Heading>',
      '<Heading level="3" id="section-1">中見出し</Heading>',
    ],
    hasReferences: false,
  },

  List: {
    name: "List",
    displayName: "リスト",
    description: "箇条書きまたは番号付きリスト",
    category: "content",
    schema: componentSchemas.List,
    examples: [
      '<List items={["項目1", "項目2", "項目3"]} />',
      '<List type="ordered" items={["手順1", "手順2"]} />',
    ],
    hasReferences: false,
  },

  Table: {
    name: "Table",
    displayName: "テーブル",
    description: "表形式のデータ表示",
    category: "content",
    schema: componentSchemas.Table,
    examples: [
      '<Table headers={["名前", "値"]} rows={[["A", "1"], ["B", "2"]]} />',
    ],
    hasReferences: false,
  },

  Quote: {
    name: "Quote",
    displayName: "引用",
    description: "引用文を表示します",
    category: "content",
    schema: componentSchemas.Quote,
    examples: [
      '<Quote>これは引用文です</Quote>',
      '<Quote cite="出典">引用文</Quote>',
    ],
    hasReferences: false,
  },

  Divider: {
    name: "Divider",
    displayName: "区切り線",
    description: "セクションを区切る水平線",
    category: "layout",
    schema: componentSchemas.Divider,
    examples: ["<Divider />"],
    hasReferences: false,
  },

  Button: {
    name: "Button",
    displayName: "ボタン",
    description: "アクションを促すボタンリンク",
    category: "content",
    schema: componentSchemas.Button,
    examples: [
      '<Button href="/contact">お問い合わせ</Button>',
      '<Button href="https://example.com" variant="secondary">詳細を見る</Button>',
    ],
    hasReferences: false,
  },
}

// ============================================
// Utility Functions
// ============================================

/**
 * コンポーネント名が有効かチェック
 */
export function isValidComponent(name: string): name is ComponentName {
  return name in componentCatalog
}

/**
 * コンポーネントのpropsをバリデート
 */
export function validateComponentProps(
  name: ComponentName,
  props: unknown
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = componentSchemas[name]
  const result = schema.safeParse(props)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * 参照を持つコンポーネント名の一覧
 */
export function getComponentsWithReferences(): ComponentName[] {
  return (Object.keys(componentCatalog) as ComponentName[]).filter(
    (name) => componentCatalog[name].hasReferences
  )
}

/**
 * カテゴリでコンポーネントをグループ化
 */
export function getComponentsByCategory(): Record<string, ComponentDefinition[]> {
  const grouped: Record<string, ComponentDefinition[]> = {}
  for (const def of Object.values(componentCatalog)) {
    if (!grouped[def.category]) {
      grouped[def.category] = []
    }
    grouped[def.category].push(def)
  }
  return grouped
}

/**
 * AI向けのカタログ情報（MCP用）
 */
export function getCatalogForAI(): Array<{
  name: string
  description: string
  props: Record<string, { type: string; description?: string; required: boolean }>
  examples: string[]
}> {
  return Object.values(componentCatalog).map((def) => {
    const shape = def.schema.shape as Record<string, z.ZodTypeAny>
    const props: Record<string, { type: string; description?: string; required: boolean }> = {}

    for (const [key, zodType] of Object.entries(shape)) {
      const isOptional = zodType.isOptional()
      props[key] = {
        type: getZodTypeName(zodType),
        description: zodType.description,
        required: !isOptional,
      }
    }

    return {
      name: def.name,
      description: def.description,
      props,
      examples: def.examples,
    }
  })
}

function getZodTypeName(zodType: z.ZodTypeAny): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeDef = (zodType as any)._zod?.def ?? (zodType as any)._def
  if (!typeDef) return "unknown"

  const typeName = typeDef.type ?? typeDef.typeName

  switch (typeName) {
    case "string":
    case "ZodString":
      return "string"
    case "number":
    case "ZodNumber":
      return "number"
    case "boolean":
    case "ZodBoolean":
      return "boolean"
    case "enum":
    case "ZodEnum":
      return `enum(${typeDef.values?.join("|") ?? ""})`
    case "array":
    case "ZodArray":
      return "array"
    case "optional":
    case "ZodOptional":
      return typeDef.innerType ? getZodTypeName(typeDef.innerType) : "unknown"
    case "default":
    case "ZodDefault":
      return typeDef.innerType ? getZodTypeName(typeDef.innerType) : "unknown"
    default:
      return "unknown"
  }
}
