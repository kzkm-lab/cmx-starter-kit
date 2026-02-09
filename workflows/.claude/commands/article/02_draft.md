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
| `update_draft` | 下書きを更新（status: "draft" に変更） |
| `search_assets` | 使用可能な画像を検索 |
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

**画像が必要な場合:**
```
search_assets(query: "関連キーワード")
→ 使用可能な画像を確認
```

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
