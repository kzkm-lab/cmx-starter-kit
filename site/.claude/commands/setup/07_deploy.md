---
description: 初回デプロイ（事前チェック → ビルド → デプロイ → リバリデーション設定案内）
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# 初回デプロイ

## 手順

### 1. 事前チェック

以下を確認する:

```bash
pnpm typecheck
pnpm lint
```

エラーがあれば修正してから続行。

### 2. 環境変数の確認

本番環境用の値が正しく設定されているか確認:
- `CMX_API_KEY` — 本番用 API キー
- `CMX_API_URL` — 本番 Admin URL
- `NEXT_PUBLIC_SITE_URL` — 本番サイト URL

### 3. コンポーネント同期

```bash
pnpm sync-components production
```

### 4. ビルド & デプロイ

```bash
pnpm build:cf && pnpm deploy
```

### 5. 事後確認

- デプロイ URL を報告
- `/api/health` のヘルスチェック
- 主要ページの表示確認

### 6. リバリデーション設定案内（任意）

コンテンツ更新時にキャッシュを自動パージしたい場合:
1. `.env.local` に `REVALIDATE_API_KEY` を設定
2. Admin → 設定 → ワークスペース → リバリデーション URL に `{SITE_URL}/api/revalidate` を設定
3. リバリデーション API キーに同じ値を設定

## 出力

```
デプロイが完了しました。

- URL: {deploy_url}
- ヘルスチェック: OK

初期構築が完了しました 🎉
今後の機能追加は /maintain/* コマンドで行えます。
/status で現在の状態をいつでも確認できます。
```
