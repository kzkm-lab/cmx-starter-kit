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
      "postCount": 42
    }
  ]
}
```

---

### search_posts

記事を検索します。関連記事の発見やBlogCard用のpostId取得に使用します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| query | string | | タイトル・slug・説明文での検索 |
| collectionId | string | | コレクションUUIDでフィルタ |
| status | string | | ステータス: `plan`, `draft`, `review`, `published` |
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
| status | string | | `plan`（企画段階）または `draft`（下書き、デフォルト） |

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

---

### get_preview_url

記事のプレビューURLを取得します。

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| postId | string | ✅ | 記事のUUID |

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

## ツール使用のベストプラクティス

1. **記事作成前**: `list_collections` でコレクション確認、`search_posts` で重複チェック
2. **コンポーネント確認**: `get_component_catalog` で使用可能なコンポーネントを取得
3. **画像挿入時**: `search_assets` で使用可能な画像を検索してassetIdを取得
4. **関連記事リンク**: `search_posts` で関連記事を検索してBlogCard用のpostIdを取得
5. **プレビュー確認**: `get_preview_url` で実際の表示を確認
6. **完了時**: `request_review` でレビュー依頼（公開は人間が判断）
