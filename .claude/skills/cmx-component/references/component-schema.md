# コンポーネント定義 JSON リファレンス

## 必須フィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `name` | string | PascalCase。TSXファイル名・MDXタグ名と一致させる |
| `displayName` | string | CMX Admin UIに表示される名前（日本語可） |
| `description` | string | 用途の説明。1-2文 |
| `category` | string | `content`, `layout`, `media`, `interactive`, `data`, `form`, `navigation` |
| `propsSchema` | object | props定義（下記参照） |

## オプションフィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `environment` | string | `production`（デフォルト）, `staging`, `preview/pr-{N}` |
| `examples` | string[] | MDXでの使用例。2-3個推奨 |

## propsSchema フォーマット

```json
"propsSchema": {
  "propName": {
    "type": "string",
    "description": "Prop description",
    "required": true
  }
}
```

### prop の type

| type | 用途 | TSX型 |
|------|------|-------|
| `string` | テキスト | `string` |
| `number` | 数値 | `number` |
| `boolean` | フラグ | `boolean` |
| `array` | リスト | `Array<T>` |
| `object` | 複合データ | `Record<string, unknown>` |

### prop のフラグ

- `"required": true` — 必須prop
- `"optional": true` — 任意prop
- `"default": value` — デフォルト値（optional時のみ）

## examples フォーマット

### セルフクロージング

```json
"examples": [
  "title=\"Example\" count={42}"
]
```

MDXでは `<ComponentName title="Example" count={42} />` として表示。

### children あり

```json
"examples": [
  "title=\"Title\">Content here</ComponentName>"
]
```

MDXでは:
```mdx
<ComponentName title="Title">
  Content here
</ComponentName>
```

### 複合props

```json
"examples": [
  "items={[{name: 'Item 1', value: 100}]}"
]
```

## バリデーションルール

- `name`: PascalCase、英数字のみ、大文字始まり
- `displayName`: 2-4語推奨
- `description`: 1-2文
- `propsSchema` の各 prop: `type` と `description` は必須
- `examples`: 異なるpropの組み合わせを示す

## 完全な例

```json
{
  "name": "PricingCard",
  "displayName": "Pricing Card",
  "description": "Display a pricing plan with features list and CTA button",
  "category": "content",
  "propsSchema": {
    "plan": {
      "type": "string",
      "description": "Plan name (e.g., 'Free', 'Pro', 'Enterprise')",
      "required": true
    },
    "price": {
      "type": "string",
      "description": "Price display text (e.g., '$9/mo', 'Custom')",
      "required": true
    },
    "features": {
      "type": "string",
      "description": "Comma-separated feature list",
      "required": true
    },
    "highlighted": {
      "type": "boolean",
      "description": "Highlight this card as recommended",
      "optional": true,
      "default": false
    },
    "children": {
      "type": "string",
      "description": "Additional description or CTA content",
      "optional": true
    }
  },
  "examples": [
    "plan=\"Free\" price=\"$0/mo\" features=\"5 posts,Basic support\"",
    "plan=\"Pro\" price=\"$29/mo\" features=\"Unlimited,Priority support\" highlighted={true}>Most popular</PricingCard>"
  ]
}
```
