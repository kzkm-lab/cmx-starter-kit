# MCP ツールリファレンス

CMX MCP サーバーが提供するツール一覧です。

## 情報取得ツール

### get_component_catalog

使用可能なMDXコンポーネントのカタログを取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| なし | - | - | - |

**レスポンス例:**
```json
{
  "components": [
    {
      "name": "Callout",
      "category": "content",
      "props": [...]
    }
  ]
}
```

---

### list_collections

すべてのコレクション（記事カテゴリ）と記事数を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| なし | - | - | - |

**レスポンス例:**
```json
{
  "collections": [
    {
      "id": "uuid",
      "type": "blog",
      "slug": "tech-blog",
      "name": "Tech Blog",
      "description": "技術記事",
      "contentCount": 42
    }
  ]
}
```

---

### search_posts

記事を検索します。関連記事の発見やBlogCard用のpostId取得に使用します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | | タイトル・slug・説明文での検索 |
| collectionId | string | | コレクションUUIDでフィルタ |
| status | string | | ステータス: `plan`, `draft`, `review`, `published`, `archived` |
| limit | number | | 最大件数（デフォルト: 10、最大: 50） |
| offset | number | | ページネーション用オフセット |

**レスポンス例:**
```json
{
  "results": [
    {
      "id": "uuid",
      "slug": "article-slug",
      "title": "記事タイトル",
      "description": "説明文",
      "status": "published",
      "collectionId": "uuid",
      "collectionSlug": "tech-blog",
      "publishedAt": "2024-01-15T00:00:00Z",
      "url": "/blog/article-slug",
      "previewUrl": "/preview/uuid"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### get_post

記事の詳細情報（MDXコンテンツ含む）を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| postId | string | ✅ | 記事のUUID |

**レスポンス例:**
```json
{
  "post": {
    "id": "uuid",
    "slug": "article-slug",
    "title": "記事タイトル",
    "description": "説明文",
    "mdx": "# 見出し\n\n本文...",
    "status": "published",
    "locale": "ja",
    "collection": {
      "id": "uuid",
      "slug": "tech-blog",
      "name": "Tech Blog"
    },
    "publishedAt": "2024-01-15T00:00:00Z",
    "previewUrl": "/preview/uuid"
  }
}
```

---

### search_assets

画像・ファイルを検索します。Image コンポーネント用の assetId 取得に使用します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| query | string | | alt テキスト・説明文での検索 |
| group | string | | グループslugでフィルタ（例: `blog-images`） |
| tags | string | | タグ名でフィルタ（カンマ区切り: `hero,featured`） |
| mime | string | | MIMEタイプ: `image`, `video`, または具体的なタイプ |
| limit | number | | 最大件数（デフォルト: 50、最大: 50） |
| offset | number | | ページネーション用オフセット |

**レスポンス例:**
```json
{
  "assets": [
    {
      "id": "uuid",
      "url": "https://...",
      "alt": "画像の説明",
      "description": "詳細説明",
      "width": 1200,
      "height": 630,
      "mime": "image/jpeg",
      "size": 102400,
      "variants": {},
      "tags": [{"name": "hero"}],
      "group": {"slug": "blog-images", "name": "ブログ画像"}
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

## コンテンツ作成ツール

### create_draft

新規記事を作成します。`status: "plan"` で企画段階、`status: "draft"` で下書き段階として作成できます。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| collectionId | string | ✅ | コレクションのUUID |
| slug | string | ✅ | URL用のスラッグ |
| title | string | ✅ | 記事タイトル |
| mdx | string | | MDXコンテンツ（planでは空または構成案のみでも可） |
| description | string | | 記事の説明文 |
| status | string | | `"plan"`（企画段階）または `"draft"`（下書き、デフォルト） |

**レスポンス例:**
```json
{
  "post": {
    "id": "uuid",
    "slug": "new-article",
    "title": "新しい記事",
    "status": "plan"
  }
}
```

---

### update_draft

記事を更新します。`status: "draft"` を指定すると、企画（plan）から下書き（draft）に昇格できます。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| postId | string | ✅ | 記事のUUID |
| mdx | string | | 新しいMDXコンテンツ |
| title | string | | 新しいタイトル |
| description | string | | 新しい説明文 |
| status | string | | `plan` または `draft`（plan→draftへの昇格に使用） |
| seoTitle | string | | SEO用タイトル（検索結果に表示、30〜60文字推奨） |
| seoDescription | string | | SEO用説明文（検索結果に表示、120〜160文字推奨） |
| ogImageAssetId | string | | OGP画像のアセットID |
| canonicalUrl | string | | 正規URL |
| noindex | boolean | | `true` で検索エンジンのインデックスを拒否 |

---

### get_preview_url

記事のプレビューURLを取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| contentId | string | ✅ | 記事のUUID |

**レスポンス例:**
```json
{
  "previewUrl": "/preview/uuid"
}
```

---

### request_review

下書きをレビュー依頼状態に変更します。**これがAIが実行できる最終アクションです。公開は人間が行います。**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| postId | string | ✅ | 下書き記事のUUID |

**レスポンス例:**
```json
{
  "post": {
    "id": "uuid",
    "status": "review"
  }
}
```

---

## 下書き管理ツール

### list_drafts

下書き一覧を取得します。ステータスや件数でフィルタできます。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| status | string | | ステータスでフィルタ: `plan`, `draft`, `review` |
| limit | number | | 最大件数 |
| offset | number | | ページネーション用オフセット |

---

### get_draft

下書きの詳細情報（MDXコンテンツ含む）を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✅ | 下書き記事のUUID |

---

### get_draft_revisions

下書きのリビジョン履歴を一覧取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✅ | 下書き記事のUUID |

**レスポンス例:**
```json
{
  "revisions": [
    {
      "id": "uuid",
      "contentId": "uuid",
      "type": "draft",
      "createdAt": "2024-01-15T00:00:00Z",
      "createdByUser": { "id": "uuid", "name": "作成者名" }
    }
  ],
  "total": 3
}
```

---

### archive_draft

下書きをアーカイブ状態に変更します。`plan` または `draft` ステータスの記事のみアーカイブ可能です。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✅ | 下書き記事のUUID |

**レスポンス例:**
```json
{
  "success": true,
  "message": "Draft archived successfully",
  "post": { "id": "uuid", "slug": "article-slug", "title": "記事タイトル", "status": "archived" }
}
```

---

### delete_draft

下書きを削除します。`plan` または `draft` ステータスの記事のみ削除可能です（公開済み・レビュー中は削除不可）。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✅ | 下書き記事のUUID |

**レスポンス例:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

---

## コンテンツ参照ツール

### set_content_references

記事にデータタイプエントリ（著者・カテゴリなど）を紐付けます。PUT で既存の参照を上書き、POST で追加マージします。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| contentId | string | ✅ | 記事のUUID（URLパスパラメータ） |
| references | array | ✅ | 参照設定の配列 |
| references[].fieldSlug | string | ✅ | 参照フィールドslug（例: `category`, `author`） |
| references[].dataEntryIds | string[] | ✅ | データエントリIDの配列 |

**リクエスト例:**
```json
{
  "references": [
    { "fieldSlug": "author", "dataEntryIds": ["uuid-1"] },
    { "fieldSlug": "category", "dataEntryIds": ["uuid-2", "uuid-3"] }
  ]
}
```

**レスポンス例:**
```json
{
  "success": true,
  "count": 3
}
```

---

## アセット管理ツール

### upload_asset

画像をアップロードします。記事内で使用する画像の登録に使用します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| file | File | ✅ | 画像ファイル（JPEG, PNG, GIF, WebP, SVG、最大10MB） |
| alt | string | | 代替テキスト |
| description | string | | 詳細説明 |
| group | string | | グループslug |
| tags | string | | タグ名（カンマ区切り） |

---

### update_asset

アセットのメタデータを更新します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| assetId | string | ✅ | アセットID |
| alt | string | | 代替テキスト |
| description | string | | 詳細説明 |
| groupSlug | string | | グループslug（`null` で削除） |
| tagNames | string[] | | タグ名の配列 |

---

### list_asset_groups

アセットグループの一覧を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| なし | - | - | - |

---

### create_asset_group

新しいアセットグループを作成します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ✅ | グループ名 |
| slug | string | ✅ | グループslug |
| description | string | | グループの説明 |

---

### list_asset_tags

アセットタグの一覧を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| なし | - | - | - |

---

### create_asset_tag

新しいアセットタグを作成します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ✅ | タグ名 |

---

## データタイプツール

### list_data_types

コレクションに属するデータタイプの一覧を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| collectionSlug | string | ✅ | コレクションのslug |

---

### list_data_entries

データタイプのエントリ一覧を取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| collectionSlug | string | ✅ | コレクションのslug |
| dataTypeSlug | string | ✅ | データタイプのslug |

---

## 公開ツール

### publish

記事を公開します。

> **注意**: `drafts:publish` パーミッションが必要です。通常のライターワークフローでは使用せず、管理画面から公開してください。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✅ | 下書き記事のUUID |

---

## ツール使用のベストプラクティス

1. **記事作成前**: `list_collections` でコレクション確認、`search_posts` で重複チェック
2. **コンポーネント確認**: `get_component_catalog` で使用可能なコンポーネントを取得
3. **画像挿入時**: `search_assets` で既存画像を検索、なければ `upload_asset` でアップロード
4. **画像整理**: `list_asset_groups` / `create_asset_group` でグループ管理、`list_asset_tags` / `create_asset_tag` でタグ管理
5. **関連記事リンク**: `search_posts` で関連記事を検索してBlogCard用のpostIdを取得
6. **データタイプ紐付け**: `list_data_types` でコレクションのデータタイプを確認、`list_data_entries` でエントリを取得して記事内で参照
7. **下書き管理**: `list_drafts` で下書き一覧を確認、`get_draft` で内容を取得して編集
8. **プレビュー確認**: `get_preview_url` で実際の表示を確認
9. **完了時**: `request_review` でレビュー依頼（公開は人間が判断）

### 推奨フロー: 記事作成

```
list_collections → search_posts（重複チェック）→ get_component_catalog
  → create_draft → update_draft（繰り返し）→ get_preview_url → request_review
```

### 推奨フロー: 画像付き記事作成

```
upload_asset（画像アップロード）→ search_assets（assetId取得）
  → create_draft（MDX内でImageコンポーネントにassetIdを指定）
```

### 推奨フロー: データタイプ参照記事

```
list_collections → list_data_types（データタイプ確認）
  → list_data_entries（エントリ取得）→ create_draft（エントリ情報を記事内で使用）
```
