---
description: CMXサイト開発を開始する。プロジェクトの状態を判定し適切なワークフローへ案内
---

# CMX 開発ガイド

プロジェクトの現在の状態を確認し、適切なワークフローへ案内します。

## 1. 状態チェック

以下を確認する:

- `cmx/site-config.md` の「基本情報」セクションが記入済みか（「未設定」のままでないか）
- `.env.local` が存在し `CMX_API_KEY` が設定されているか
- `cmx/generated/` 配下にファイルが存在するか
- `src/app/` 配下にテンプレートデフォルト以外のカスタムページがあるか

## 2. 判定と案内

```
site-config.md が未記入
  → 初期構築フェーズ。/setup/01_config から開始

site-config.md 記入済み & .env.local なし
  → 環境未設定。/setup/02_init から再開

site-config.md 記入済み & .env.local あり & generated/ なし
  → スキーマ未定義。/setup/03_schema から再開

site-config.md 記入済み & .env.local あり & generated/ あり & カスタムページなし
  → ページ未実装。/setup/05_pages から再開

すべて揃っている
  → 保守フェーズ。/maintain/* コマンド一覧を表示
```

## 3. 初期構築フロー

| ステップ | コマンド | 内容 |
|---------|---------|------|
| 1 | `/setup/01_config` | サイトコンフィグ作成 |
| 2 | `/setup/02_init` | 環境セットアップ |
| 3 | `/setup/03_schema` | スキーマ設計 |
| 4 | `/setup/04_generate` | コード生成 |
| 5 | `/setup/05_pages` | ページ実装 |
| 6 | `/setup/06_components` | コンポーネント作成 |
| 7 | `/setup/07_deploy` | デプロイ |

## 4. 保守・拡張

| コマンド | 内容 |
|---------|------|
| `/maintain/config` | サイトコンフィグ更新 |
| `/maintain/collection` | コレクション追加 |
| `/maintain/datatype` | データタイプ追加 |
| `/maintain/component` | コンポーネント追加 |
| `/maintain/form` | フォーム追加 |
| `/maintain/page` | 静的ページ追加 |
| `/maintain/style` | スタイル・デザイン変更 |

## ユーティリティ

| コマンド | 内容 |
|---------|------|
| `/generate` | コード再生成 |
| `/sync` | コンポーネント同期 |
| `/deploy` | デプロイ |
| `/status` | 現状確認 |
