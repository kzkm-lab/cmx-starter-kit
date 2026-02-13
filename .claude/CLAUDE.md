# CMX Starter Kit — Claude Code Instructions

## プロジェクト構成

このプロジェクトは `site/`（公開サイト）と `dev/`（開発UI）の2つのワークスペースで構成されています。

```
cmx-starter-kit/
├── site/          # 公開サイト — エージェントの操作対象
├── dev/           # 開発UI（セットアップ）— エージェントは触らない
├── .claude/       # スキル・コマンド（site/ を対象）
└── workflows/     # ライター向けワークフロー
```

**重要：エージェントの操作対象は `site/` ディレクトリのみです。`dev/` ディレクトリのコードには触れないでください。**

- ファイル操作（Read/Write/Edit）は `site/` 内のみ
- コマンド実行（Bash）は `site/` をcwdとする
- `dev/` はセットアップUI用の開発環境で、Agent SDK が動作します

## 共通ルール・アーキテクチャ

@AGENTS.md

## サイト設定

@cmx/site-config.md

## 執筆ルール（ライター向け）

@workflows/style-guide.md

## Claude Code ワークフロー

### 初期構築

新規サイトは `/setup/start` から開始。状態を自動判定し、適切なステップへ案内する。

| ステップ | コマンド | 使用スキル |
|---------|---------|-----------|
| サイトコンフィグ&スタイルガイド作成 | `/setup/01_config` | — |
| 環境セットアップ | `/setup/02_init` | — |
| スキーマ設計 | `/setup/03_schema` | cmx-schema |
| コード生成 | `/setup/04_generate` | — |
| ページ実装 | `/setup/05_pages` | cmx-dev |
| コンポーネント作成 | `/setup/06_components` | cmx-component |
| デプロイ | `/setup/07_deploy` | — |
| テストデータ投入 | `/setup/08_seed` | cmx-content |

### 保守・拡張

| コマンド | 使用スキル | 内容 |
|---------|-----------|------|
| `/maintain/config` | — | サイトコンフィグ&スタイルガイド更新 |
| `/maintain/collection` | cmx-schema + cmx-dev | コレクション追加 |
| `/maintain/datatype` | cmx-schema + cmx-dev | データタイプ追加 |
| `/maintain/component` | cmx-component | コンポーネント追加 |
| `/maintain/form` | cmx-form | フォーム追加 |
| `/maintain/page` | cmx-dev | 静的ページ追加 |
| `/maintain/style` | cmx-style | スタイル・デザイン変更 |
| `/maintain/migrate` | cmx-content | サイト移行（既存コンテンツ取り込み） |

### ユーティリティ

| コマンド | 内容 |
|---------|------|
| `/generate` | スキーマからコード再生成 |
| `/sync` | コンポーネントを Admin に同期 |
| `/deploy` | デプロイ |
| `/status` | プロジェクト現状確認 + 次のアクション案内 |

### 記事作成（workflows/ — ライター配布用）

| コマンド | 内容 |
|---------|------|
| `/article/01_plan` | 記事企画・提案（MCP経由） |
| `/article/02_draft` | 下書き執筆（MCP経由） |
| `/article/03_review` | レビュー依頼（MCP経由） |

### スキル一覧

| スキル | 自動トリガー | 内容 |
|-------|------------|------|
| cmx-schema | 「スキーマ」「データタイプを作りたい」「コレクションを追加」 | スキーマ JSON 生成、フィールドタイプ、移行シナリオ |
| cmx-dev | 「ページを追加」「データを表示」「コレクションページ」 | ページ実装テンプレート、API リファレンス、コード生成 |
| cmx-component | 「コンポーネントを作成」「MDXコンポーネント」 | JSON定義 → TSX実装 → export → 同期のワークフロー |
| cmx-form | 「フォーム」「お問い合わせ」「送信」 | フォーム UI 実装、submissions API、バリデーション |
| cmx-style | 「スタイル変更」「デザイン」「色」「フォント」 | CSS/レイアウト変更パターン、site-config との連動 |
| cmx-seo | 「SEO」「OGP」「sitemap」「メタデータ」 | metadata, sitemap.ts, robots.ts, JSON-LD |
| cmx-cache | 「キャッシュ」「パフォーマンス」「ISR」 | force-dynamic → ISR 切り替え、CACHE_TAGS、リバリデーション |
| cmx-content | 「テストデータ」「記事を投入」「移行」「シード」 | Admin API でのコンテンツ作成、MDX テンプレート、スクレイピング→変換 |
