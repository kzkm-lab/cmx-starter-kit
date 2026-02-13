---
description: 記事の下書きを執筆
argument-hint: [postId（省略可）]
---

# 下書き執筆

企画に基づいて記事の下書きを執筆します。

## 参照ドキュメント

- @style-guide.md
- @mdx-security.md
- @mcp-tools.md

## 使用するMCPツール

| ツール | 用途 |
|--------|------|
| `search_posts` | 企画（plan）または下書き（draft）を検索 |
| `get_post` | 記事内容を取得 |
| `get_component_catalog` | 使用可能なMDXコンポーネントを取得 |
| `update_draft` | 下書きを更新（status: "draft" に変更、SEOフィールド設定含む） |
| `search_assets` | 使用可能な画像を検索 |
| `upload_asset` | 画像が見つからない場合にアップロード |
| `list_asset_groups` | アセットグループ一覧を確認 |
| `create_asset_group` | 新しいアセットグループを作成 |
| `list_asset_tags` | アセットタグ一覧を確認 |
| `create_asset_tag` | 新しいアセットタグを作成 |
| `update_asset` | アセットのメタデータ（alt、タグ等）を更新 |
| `list_data_types` | コレクションのデータタイプ一覧を確認 |
| `list_data_entries` | データタイプのエントリ一覧を取得 |
| `set_content_references` | 記事にデータタイプ（著者・カテゴリ等）を紐付け |
| `get_preview_url` | プレビューURLを取得 |

## 手順

### 1. 対象記事の特定

入力: $ARGUMENTS

```
引数あり？
  ├─ YES → そのpostIdで進む
  └─ NO → search_posts(status: "plan")
              ├─ あり → 「どの企画で始めますか？」と質問
              └─ なし → 「企画がありません」で終了
```

### 下書きの続きを探す場合

ユーザーが「下書きの続きをしたい」「draftを探して」と言った場合:

```
search_posts(status: "draft")
→ 「どの下書きを続けますか？」と質問
```

### 2. 記事情報の読み込み

```
get_post(postId)
→ 現在の内容・構成案を確認
```

### 3. 使用可能コンポーネントの確認

```
get_component_catalog
→ 使用可能なMDXコンポーネント一覧を取得
```

### 4. 下書き執筆

企画の構成案に沿って本文を執筆する。

**執筆時のポイント:**
- @style-guide.md のトーン・フォーマットを遵守
- @mdx-security.md の禁止構文を使わない
- `get_component_catalog` で取得したコンポーネントのみ使用
- 見出し構成は企画に従う

### 4a. 画像確保フロー

記事に画像が必要な場合、以下の手順で画像を確保する。

**ステップ1: 既存画像の検索**
```
search_assets(query: "関連キーワード")
→ 使用可能な画像があるか確認
```

**ステップ2: 画像が見つからない場合、アップロード**
```
upload_asset(file, alt: "画像の説明", description: "詳細説明")
→ 新しい画像をアップロード
```

**ステップ3: 必要に応じてグループ・タグを作成**
```
list_asset_groups
→ 既存グループを確認

create_asset_group(name: "ブログ画像", slug: "blog-images")
→ 適切なグループがなければ作成

list_asset_tags
→ 既存タグを確認

create_asset_tag(name: "hero")
→ 適切なタグがなければ作成

update_asset(assetId, groupSlug: "blog-images", tagNames: ["hero"])
→ アセットにグループ・タグを設定
```

### 4b. データタイプ紐付けフロー

コレクションにデータタイプ（著者・カテゴリなど）がある場合、記事に紐付ける。

**ステップ1: データタイプの確認**
```
list_data_types(collectionSlug)
→ コレクションに属するデータタイプを確認（例: 著者、カテゴリ）
```

**ステップ2: エントリ一覧の取得**
```
list_data_entries(collectionSlug, dataTypeSlug)
→ 各データタイプのエントリ一覧を取得
```

**ステップ3: ユーザーに選択を提示**
```
以下のデータタイプを記事に紐付けできます：

- **著者**: 田中太郎, 山田花子, ...
- **カテゴリ**: チュートリアル, ニュース, ...

どれを選択しますか？
```

**ステップ4: 記事に紐付け**
```
set_content_references(postId, dataTypeSlug, entryIds)
→ 選択されたエントリを記事に紐付け
```

### 4c. SEO設定

下書き更新時にSEOフィールドを設定する。

```
update_draft(postId, seoTitle: "SEO用タイトル", seoDescription: "検索結果に表示される説明文")
→ SEOメタデータを設定
```

**SEO設定のポイント:**
- `seoTitle`: 30〜60文字程度、キーワードを前半に含める
- `seoDescription`: 120〜160文字程度、記事の価値提案を含める
- 未設定の場合はタイトル・説明文がそのまま使用される

### 5. 下書き更新

```
update_draft(postId, mdx, title?, description?, status: "draft")
→ 下書きを保存、ステータスを "draft" に変更
```

### 6. プレビュー確認

```
get_preview_url(postId)
→ プレビューURLを提示
```

## 出力

```
下書きを更新しました。

- **postId**: {postId}
- **タイトル**: {タイトル}
- **ステータス**: draft
- **プレビュー**: {プレビューURL}

確認後、問題なければ /article/03_review でレビュー依頼できます。
```

## 注意事項

- `get_component_catalog` に存在しないコンポーネントは使用禁止
- 公開は人間が行う（AIは下書き・レビュー依頼まで）
- plan → draft へのステータス変更を忘れずに
