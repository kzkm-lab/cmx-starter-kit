---
name: cmx-component
description: |
  CMX Starter Kitのカスタムコンポーネント作成・管理スキル。
  MDXコンテンツ内で使えるカスタムReactコンポーネントの定義（JSON）、実装（TSX）、エクスポート、同期の全ワークフローを提供。
  トリガー: 「コンポーネントを作成」「カスタムコンポーネントを追加」「MDXコンポーネントを作りたい」
  「FeatureCardのようなコンポーネントが欲しい」「CMXにコンポーネントを同期」など。
---

# CMX Custom Component ワークフロー

## ファイル構成

```
cmx/components/{name}.json       # コンポーネント定義（CMX Admin用）
src/components/custom/{Name}.tsx   # React実装
src/components/custom/index.ts     # エクスポート一覧
```

## ワークフロー

### 1. ヒアリング

ユーザーに確認:
- 用途（何を表示するか）
- 必須/任意のprops
- デザインの方向性

### 2. JSON定義を作成

`cmx/components/{kebab-case}.json` に作成。詳細フォーマットは [references/component-schema.md](references/component-schema.md) を参照。

```json
{
  "name": "FeatureCard",
  "displayName": "Feature Card",
  "description": "Display a feature with icon, title, and description",
  "category": "content",
  "propsSchema": {
    "title": {
      "type": "string",
      "description": "Feature title",
      "required": true
    },
    "icon": {
      "type": "string",
      "description": "Emoji icon",
      "optional": true
    },
    "children": {
      "type": "string",
      "description": "Card body text",
      "required": true
    }
  },
  "examples": [
    "title=\"Fast\" icon=\"⚡\">Lightning fast load times</FeatureCard>",
    "title=\"Simple\">Easy to use interface</FeatureCard>"
  ]
}
```

### 3. React実装

`src/components/custom/{PascalCase}.tsx` に作成:

```tsx
interface FeatureCardProps {
  title: string
  icon?: string
  children: React.ReactNode
}

export function FeatureCard({ title, icon, children }: FeatureCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {icon && <div className="mb-3 text-3xl">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
```

**スタイリングルール:**
- Tailwind CSS を使用
- shadcn/ui の CSS変数（`bg-card`, `text-muted-foreground` 等）を活用
- レスポンシブ対応（`md:`, `lg:` プレフィックス）
- セマンティックHTML

### 4. エクスポート追加

`src/components/custom/index.ts` に追記:

```ts
export { FeatureCard } from "./FeatureCard"
```

このファイルで export されたコンポーネントは、MDXレンダリング時に自動的に利用可能になる（`src/lib/mdx/render.tsx` が `import * as customComponents` で読み込む）。

### 5. 同期

```bash
pnpm sync-components          # ブランチから環境を自動判定
pnpm sync-components production  # 明示的に環境を指定
```

GitHub Actions が push/PR 時に自動同期も行う。

## チェックリスト

- [ ] `cmx/components/{name}.json` が正しいフォーマット
- [ ] `src/components/custom/{Name}.tsx` が実装済み
- [ ] `src/components/custom/index.ts` にエクスポート追加
- [ ] props の型が JSON定義と TSX実装で一致
- [ ] children を使うコンポーネントは `React.ReactNode` 型で受け取り
- [ ] Tailwind CSS でスタイリング
- [ ] アクセシビリティ考慮（セマンティックHTML、ARIA）
