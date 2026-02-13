---
description: 環境セットアップ（環境変数、依存インストール、起動確認）
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit
---

# 環境セットアップ

## 手順

### 1. 環境変数の作成

`.env.example` を `.env.local` にコピーする。

ユーザーに確認:

- **CMX Admin の URL は？** → `CMX_API_URL` に設定
- **API キーを持っていますか？**
  - YES → `CMX_API_KEY` に設定
  - NO → 以下の手順を案内:
    1. CMX Admin にログイン
    2. 設定 → API キー → 新規作成
    3. プリセット「Public Site」を選択（推奨）
    4. 発行されたキーをコピー（一度しか表示されない）
- **サイトの公開 URL は？**（ローカル開発中は `http://localhost:3000`）→ `NEXT_PUBLIC_SITE_URL` に設定

### 2. 依存インストール

```bash
pnpm install
```

### 3. 起動確認

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開き、エラーなく表示されることを確認。
API エラーが出る場合は `CMX_API_KEY` と `CMX_API_URL` を再確認する。

### 4. GitHub Secrets 設定（任意）

コンポーネント同期の自動化を使う場合、GitHub リポジトリの Settings → Secrets に設定:
- `CMX_API_KEY`
- `CMX_API_URL`

## 出力

```
環境セットアップが完了しました。

- CMX API URL: {url}
- API キー: 設定済み ✓
- 開発サーバー: http://localhost:3000

次のステップ: /setup/03_schema でコンテンツ構造を設計しましょう。
```
