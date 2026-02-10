---
name: cmx-cache
description: |
  CMX Starter Kit のキャッシュ戦略スキル。force-dynamic → ISR 切り替え、sdkFetchWithTags、CACHE_TAGS、リバリデーション設定、Cloudflare R2 キャッシュ。
  トリガー: 「キャッシュを設定」「ISRに切り替え」「リバリデーションを設定」
  「force-dynamicを外す」「キャッシュタグを設定」「パフォーマンス改善」
  「ページの表示速度を上げたい」「キャッシュ戦略」「R2キャッシュ」
  「revalidateを設定」「オンデマンド再検証」など。
---

# CMX キャッシュ戦略

## 現状の構成

スターターキットの初期状態は全ページ `export const dynamic = "force-dynamic"`（毎リクエスト SSR）。ISR 基盤（R2 バケット、リバリデーション API）は構築済み。

## ISR 移行の判断基準

| 条件 | 推奨 |
|------|------|
| コンテンツ更新頻度が低い | ISR（revalidate: 3600 等） |
| リアルタイム性が必要 | force-dynamic のまま |
| プレビューページ | 常に force-dynamic |
| 静的ページ（about 等） | ISR（revalidate: 86400）または静的生成 |

## 移行手順

詳細は [references/cache-patterns.md](references/cache-patterns.md) を参照。

### 1. ページの revalidate 設定

`export const dynamic = "force-dynamic"` を削除し `export const revalidate = 秒数` に変更。

### 2. タグ付き fetch に切り替え

`sdkFetchWithTags` を使い、CACHE_TAGS でタグを付与。

### 3. リバリデーション API の確認

`/api/revalidate` エンドポイントが動作することを確認。`REVALIDATE_API_KEY` 環境変数が必要。

### 4. Cloudflare R2 の確認

`wrangler.jsonc` で R2 バケットバインディング `NEXT_INC_CACHE_R2_BUCKET` が設定済みか確認。

## 変更後

1. デプロイ後にページの `Cache-Control` ヘッダーを確認
2. コンテンツ更新後にリバリデーションが動作することを確認
3. プレビューページが常に最新データを返すことを確認
