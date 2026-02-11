# CMX Starter Kit — AI Agent Instructions

このファイルはAIコーディングエージェント（Claude Code, Cursor, GitHub Copilot, Google Jules 等）向けの共通指示書です。

## サイト設定

サイト固有の設定は以下を参照:

→ cmx/site-config.md — 開発方針（種別・トーン・デザイン方針・禁止事項）
→ workflows/style-guide.md — 執筆ルール（文体・用語・記事構成）

すべてのコード変更・提案は site-config.md の方針と矛盾しないことを確認すること。
コンテンツ生成時は style-guide.md のトーン・フォーマットに従うこと。

## ライター向けワークフロー

`workflows/` フォルダにライター向けの記事作成ワークフローを格納。
ライターにはこのフォルダを配布し、MCP 経由で CMX に接続して記事を作成する。

- `workflows/.mcp.json` — MCP サーバー接続設定（API キーを設定）
- `workflows/.claude/commands/article/` — 記事ワークフロー（企画→下書き→レビュー依頼）
- `workflows/style-guide.md` — 執筆ルール（`/setup/01_config` で作成、`/maintain/config` で更新）
- `workflows/mdx-security.md` — MDX 禁止構文（静的・全テナント共通）
- `workflows/mcp-tools.md` — MCP ツールリファレンス

使用可能な MDX コンポーネントは MCP ツール `get_component_catalog` で動的に取得する（コードが正）。

---

## アーキテクチャ

CMX Starter Kit はヘッドレスCMSのフロントエンドテンプレートです。

```
CMX Admin（サービス側）              Starter Kit（このリポジトリ）
┌─────────────────────┐            ┌──────────────────────────┐
│ コレクション / データタイプ │  Public  │ Next.js 16 (App Router)   │
│ 投稿 / アセット / フォーム │  API    │ cmx-sdk でデータ取得       │
│                     │◄─────────│ Cloudflare Workers デプロイ │
│ APIキー ─────────────────────────│ .env の CMX_API_KEY で認証  │
└─────────────────────┘            └──────────────────────────┘
```

### 厳守ルール

- **すべてのデータ取得は `cmx-sdk` 経由。** DB直接アクセスは存在しない
- **サーバーコンポーネントがデフォルト。** クライアントコンポーネントは必要最小限に
- **CMXデータを取得するページには `export const dynamic = "force-dynamic"` を必ず付ける**
- **MDXレンダリングは `src/lib/mdx/render.tsx` の `renderMdx` を使う。** 独自のMDX処理を書かない
- **カスタムコンポーネントは `src/components/custom/index.ts` から export する。** export すれば MDX 内で自動的に使用可能になる
- **`cmx/generated/` 配下のファイルは手動編集禁止。** `npx cmx-sdk generate` で再生成する

---

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `CMX_API_KEY` | 必須 | CMX Admin で発行した API キー |
| `CMX_API_URL` | 必須 | CMX Admin インスタンスの URL |
| `CMX_WORKSPACE_ID` | 任意 | ワークスペースID（APIキーから自動判定） |
| `NEXT_PUBLIC_SITE_URL` | 必須 | 公開サイトの URL |
| `REVALIDATE_API_KEY` | 任意 | リバリデーション用の秘密鍵 |

---

## コマンド

```bash
pnpm dev                   # 開発サーバー起動（Turbopack, port 3000）
pnpm build                 # Next.js ビルド
pnpm build:cf              # Cloudflare Workers 向けビルド
pnpm deploy                # Cloudflare Workers デプロイ
pnpm typecheck             # TypeScript 型チェック
pnpm lint                  # ESLint
pnpm sync-components       # カスタムコンポーネントを Admin に同期
npx cmx-sdk generate       # スキーマから型付きコードを自動生成
npx cmx-sdk create-collection --json '...'  # コレクションを API 経由で作成
npx cmx-sdk create-data-type --json '...'   # データタイプを API 経由で作成
npx cmx-sdk create-data-entry --type-slug {slug} --json '...'  # データエントリを作成
npx cmx-sdk import-schema --file schema.json  # コレクション・データタイプを一括登録
```

---

## ファイル構成

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # ルートレイアウト（Header/Footer）
│   ├── page.tsx                      # ホームページ
│   ├── {collection}/page.tsx         # コレクション一覧
│   ├── {collection}/[slug]/page.tsx  # コレクション記事詳細
│   ├── preview/[token]/page.tsx      # プレビュー
│   └── api/revalidate/route.ts       # リバリデーション Webhook
├── components/
│   ├── custom/                       # カスタム MDX コンポーネント
│   │   ├── index.ts                  # ← ここから export = MDX で使用可能
│   │   └── {Name}.tsx
│   ├── layout/                       # Header, Footer
│   ├── public/                       # 共通 UI（パンくず等）
│   └── ui/                           # shadcn/ui ベースコンポーネント
├── lib/
│   ├── api/
│   │   ├── admin-client.ts           # cmx-sdk の re-export
│   │   └── public-client.ts          # エラーハンドリング付きラッパー
│   ├── mdx/
│   │   ├── render.tsx                # MDX レンダリング（コンポーネント自動注入）
│   │   ├── component-catalog.ts      # コンポーネントカタログ
│   │   └── validator.ts              # MDX バリデーション
│   ├── utils/
│   │   ├── data-fetching.ts          # requireFetchPosts, requireFetchContent, requireDataEntries
│   │   ├── metadata.ts              # generateCollectionMetadata, generatePostMetadata
│   │   └── date.ts                   # formatPostDate
│   └── constants/
│       └── collections.ts            # COLLECTION_SLUGS 定数
cmx/
├── site-config.md                    # サイト固有設定（トーン・デザイン・禁止事項）
├── generated/                        # 自動生成コード（手動編集禁止）
│   ├── collections/{slug}.ts         # get{Name}Contents(), get{Name}ContentDetail()
│   └── data-types/{slug}.ts          # {Name}型, get{Name}(), get{Name}ById()
├── components/{name}.json            # カスタムコンポーネント JSON 定義
└── scripts/sync-components.js        # コンポーネント同期スクリプト
```

---

## 開発フロー

### 初期構築

新規サイトは以下の順序で構築する:

```
1. サイトコンフィグ作成    cmx/site-config.md を作成
2. 環境セットアップ        .env.local 設定 → pnpm install → pnpm dev
3. スキーマ設計            コレクション・データタイプの JSON 定義を作成
                          → npx cmx-sdk import-schema で API 経由登録
4. テストデータ投入        Admin 側でコンテンツを作成し「公開」にする
5. コード生成              npx cmx-sdk generate で型付き関数を生成
6. ページ実装              一覧ページ・詳細ページ・静的ページを作成
7. コンポーネント作成      MDX 用カスタムコンポーネントを定義・実装・同期
8. デプロイ                pnpm build:cf && pnpm deploy
```

### 保守・拡張

構築後の変更は以下のパターン:

| やりたいこと | 作業内容 |
|------------|---------|
| コレクション追加 | スキーマJSON作成 → `npx cmx-sdk create-collection` → `npx cmx-sdk generate` → 一覧+詳細ページ作成 → Header追加 |
| データタイプ追加 | スキーマJSON作成 → `npx cmx-sdk create-data-type` → `npx cmx-sdk generate` → 一覧ページ作成 |
| コンポーネント追加 | `cmx/components/{name}.json` + `src/components/custom/{Name}.tsx` + export追加 → `pnpm sync-components` |
| フォーム追加 | Admin側フォーム定義 → クライアントコンポーネント作成 → submissions API送信実装 |
| スタイル変更 | site-config.md 確認 → globals.css / layout コンポーネント修正 → site-config.md 同期 |
| 静的ページ追加 | `src/app/{path}/page.tsx` 作成 → メタデータ設定 → Header追加 |
| SEO設定 | sitemap.ts / robots.ts 作成、generateMetadata() カスタマイズ |
| キャッシュ最適化 | force-dynamic → sdkFetchWithTags() + CACHE_TAGS + リバリデーション設定 |

---

## コンテンツ種別の判断基準

CMX には「コレクション」と「データタイプ」の2種類がある。

| 条件 | 選択 |
|------|------|
| MDX 本文（記事・ページ）を持つ | **コレクション** |
| 構造化フィールドのみ（一覧表示用） | **データタイプ** |

### コレクションの type 選択

| type | 用途 | ソート順 |
|------|------|---------|
| `post` | ブログ、コラム等の時系列コンテンツ | publishedAt 降順 |
| `news` | お知らせ、プレスリリース | publishedAt 降順 |
| `page` | 固定ページ（会社概要、サービス紹介等） | sortOrder 昇順 |
| `doc` | ドキュメント、マニュアル（ツリー構造） | ツリー構造 + sortOrder |

### データタイプのフィールドタイプ

`text`, `textarea`, `richtext`, `number`, `date`, `datetime`, `boolean`, `select`, `multiselect`, `image`, `file`, `json`, `url`, `email`, `relation`

---

## API パターン

### データ取得

```tsx
// cmx-sdk 直接（汎用）
import { getCollectionContents, getCollectionContentDetail, getDataEntries, getDataEntry } from "cmx-sdk"

// re-export 経由（推奨）
import { getCollectionContents, getCollectionContentDetail, getDataEntries } from "@/lib/api/admin-client"

// エラー時 throw するラッパー（ページで使用）
import { requireFetchPosts, requireFetchContent, requireDataEntries } from "@/lib/utils/data-fetching"

// 型付き自動生成関数（npx cmx-sdk generate 後）
import { getBlogContents, getBlogContentDetail } from "@/cmx/generated"
import { getStaff, getStaffById } from "@/cmx/generated"
```

### ページテンプレート: コレクション一覧

```tsx
// src/app/{collection}/page.tsx
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchPosts } from "@/lib/utils/data-fetching"
import { generateCollectionMetadata } from "@/lib/utils/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return generateCollectionMetadata(COLLECTION_SLUGS.xxx)
}

export default async function ListPage() {
  const { collection, contents } = await requireFetchPosts(COLLECTION_SLUGS.xxx)
  return (/* 一覧 UI */)
}
```

### ページテンプレート: コレクション詳細

```tsx
// src/app/{collection}/[slug]/page.tsx
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchContent } from "@/lib/utils/data-fetching"
import { generatePostMetadata } from "@/lib/utils/metadata"
import { renderMdx } from "@/lib/mdx/render"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return generatePostMetadata(COLLECTION_SLUGS.xxx, slug)
}

export default async function DetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { content, references } = await requireFetchContent(COLLECTION_SLUGS.xxx, slug)
  const { content: rendered } = await renderMdx(content.mdx, references)
  return (
    <article className="prose prose-lg max-w-none">{content}</article>
  )
}
```

### ページテンプレート: データタイプ一覧

```tsx
// src/app/{path}/page.tsx
import { getDataEntries } from "@/lib/api/admin-client"
// または型付き: import { getStaff } from "@/cmx/generated"

export const dynamic = "force-dynamic"

export default async function DataListPage() {
  const data = await getDataEntries("type-slug", { sortBy: "createdAt", sortOrder: "asc" })
  if (!data) throw new Error("Failed to fetch data")
  return (/* 一覧 UI */)
}
```

### MDX レンダリング

```tsx
import { renderMdx } from "@/lib/mdx/render"

const { content } = await renderMdx(item.mdx, references)
// content は ReactElement → JSX に直接埋め込む
<div className="prose prose-lg max-w-none">{content}</div>
```

### キャッシュタグ（ISR 使用時）

```tsx
import { CACHE_TAGS } from "@/lib/api/admin-client"

CACHE_TAGS.collections            // 全コレクション
CACHE_TAGS.collection("blog")     // 特定コレクション
CACHE_TAGS.content("blog", "slug") // 特定記事
CACHE_TAGS.data                   // 全データ型
CACHE_TAGS.dataType("faq")        // 特定データ型
```

---

## コンポーネント作成フロー

MDX 記事内で使えるカスタムコンポーネントを追加するには、3つのファイルを作成する:

### 1. JSON 定義 (`cmx/components/{kebab-case}.json`)

```json
{
  "name": "PascalCase名",
  "displayName": "表示名",
  "description": "用途の説明",
  "category": "content",
  "propsSchema": {
    "title": { "type": "string", "description": "タイトル", "required": true },
    "icon": { "type": "string", "description": "アイコン", "optional": true }
  },
  "examples": [
    "title=\"Example\" icon=\"⚡\">本文</ComponentName>"
  ]
}
```

カテゴリ: `content`, `layout`, `media`, `interactive`, `data`, `form`, `navigation`

### 2. React 実装 (`src/components/custom/{PascalCase}.tsx`)

- Tailwind CSS でスタイリング
- shadcn/ui の CSS 変数（`bg-card`, `text-muted-foreground` 等）を活用
- レスポンシブ対応（`md:`, `lg:` プレフィックス）

### 3. エクスポート追加 (`src/components/custom/index.ts`)

```ts
export { ComponentName } from "./ComponentName"
```

### 4. 同期

```bash
pnpm sync-components
```

GitHub Actions が push/PR 時にも自動同期する。

---

## スキーマ JSON フォーマット

`npx cmx-sdk` コマンド（推奨）または Admin UI の「JSON からインポート」で使用するフォーマット。

### コレクション

```json
{
  "type": "post",
  "slug": "英数字-ハイフン",
  "name": "表示名",
  "description": "説明（任意）"
}
```

### データタイプ

```json
{
  "slug": "英数字-ハイフン",
  "name": "表示名",
  "description": "説明（任意）",
  "fields": [
    {
      "key": "英数字_アンダースコア",
      "label": "表示ラベル",
      "type": "text",
      "required": true,
      "description": "ヘルプテキスト（任意）",
      "options": {}
    }
  ]
}
```

### フィールド options 例

```json
// text / textarea
{ "maxLength": 100, "placeholder": "入力してください" }

// number
{ "min": 0, "max": 999, "step": 1 }

// select
{ "choices": [{ "value": "key", "label": "表示名" }] }

// relation
{ "targetType": "参照先データタイプのslug" }
```

---

## リバリデーション

コンテンツ更新時にフロントのキャッシュを自動パージする仕組み。

1. **Admin 側**: 設定 → ワークスペース → リバリデーション URL に `{SITE_URL}/api/revalidate` を設定
2. **フロント側**: `src/app/api/revalidate/route.ts` が Webhook を受け取り、キャッシュタグ単位でパージ
3. **認証**: `REVALIDATE_API_KEY` 環境変数で X-API-Key ヘッダーを検証

---

## プレビュー

下書きコンテンツの確認フロー:

1. Admin でプレビュートークンを発行
2. `{SITE_URL}/preview/{token}` でアクセス
3. API キー認証不要、有効期限付き
4. `src/app/preview/[token]/page.tsx` がレンダリング
