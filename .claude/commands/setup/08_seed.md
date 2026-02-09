---
description: テストデータを投入する（表示確認用の記事を作成）
disable-model-invocation: true
allowed-tools: Bash, Read, Glob, Grep
---

# テストデータ投入

使用するスキル: cmx-content

Admin API 経由で表示確認用の記事を作成します。

## 参照ドキュメント

- @cmx/site-config.md
- @workflows/style-guide.md

## 事前確認

1. `.env.local` に `CMX_API_KEY`, `CMX_API_URL` が設定済みか
2. Admin 側でコレクションが登録済みか
3. `npx cmx-sdk generate` が実行済みか（コレクション定数を使用）

## 手順

### 1. コレクション情報の取得

Admin API でコレクション一覧を取得し、各コレクションの ID と type を把握する。

### 2. 投入内容の確認

ユーザーに確認:

```
以下のコレクションにテスト記事を投入します:

- {コレクション名} ({type}): 2-3件
- {コレクション名} ({type}): 2-3件

よろしいですか？件数やコレクションを変更したい場合はお知らせください。
```

### 3. テスト記事の生成

site-config.md のトーン・style-guide.md の文体に合わせて記事を生成:

- 各コレクションに 2-3 件
- 異なる長さの記事を含める（短文、中文、長文）
- 登録済みコンポーネントがあれば 1 件はコンポーネントを含む記事にする
- slug は `test-` プレフィックスを付ける

### 4. Admin API で投入

各記事を `POST /api/v1/admin/posts` で作成 → `POST /api/v1/admin/posts/:id/publish` で公開。

### 5. 確認

開発サーバー (`pnpm dev`) で各ページの表示を確認。

## 出力

```
テストデータを投入しました:

- {コレクション名}: {n}件
  - {タイトル} (/{collection}/{slug})
  - ...

開発サーバーで表示を確認してください。
テストデータは確認後、Admin の投稿一覧から削除できます。
```
