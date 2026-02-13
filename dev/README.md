# CMX Starter Kit - Setup UI

AI アシスタントによるインタラクティブなセットアップUIです。

## 機能

- **OAuth Handoff 認証**: Claude Code サブスクリプションでの認証
- **AI チャット**: Agent SDK を使用したファイル操作・コード生成
- **リアルタイムストリーミング**: SSE による応答のリアルタイム表示
- **安全な操作範囲**: `site/` ディレクトリのみを操作対象に制限

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下の環境変数を設定：

```env
# Anthropic API Key（Agent SDK用）
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Claude Code API Base URL（OAuth認証用）
CLAUDE_CODE_API_BASE_URL=https://api.claude.ai/v1

# アプリケーションURL（OAuth コールバック用）
NEXT_PUBLIC_APP_URL=http://localhost:4001
```

### 2. 依存パッケージのインストール

```bash
pnpm install
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

→ http://localhost:4001 でアクセス

## 認証フロー

1. 右上の「Claude Code で認証」ボタンをクリック
2. 新しいウィンドウで Claude Code にログイン
3. 認証が完了すると自動的にウィンドウが閉じる
4. チャット入力が有効化される

## 使い方

認証完了後、チャット入力欄にメッセージを送信します。

**例:**
- 「サイトをセットアップしてください」
- 「ヘッダーのロゴを変更してください」
- 「ブログページを作成してください」

AI アシスタントが `site/` ディレクトリ内のファイルを自動で編集・作成します。

## アーキテクチャ

### 認証

- **OAuth Handoff パターン**: PKCE ベースの認証フロー
- **トークンストレージ**: `~/.cmx/credentials.json` に保存
- **自動リフレッシュ**: アクセストークンの有効期限を自動で更新

### Agent SDK 統合

- **パーミッション制御**: `canUseTool` コールバックで操作範囲を制限
- **セッション管理**: メモリベースのセッションストア（10分で自動削除）
- **ストリーミング**: SSE による応答のリアルタイム表示

### ファイル構成

```
dev/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── init/        # OAuth 開始
│   │   │   │   ├── callback/    # OAuth 完了
│   │   │   │   └── status/      # 認証状態確認
│   │   │   └── setup/
│   │   │       └── chat/        # Agent SDK チャット
│   │   ├── _components/
│   │   │   ├── auth-status.tsx  # 認証状態表示
│   │   │   └── chat-interface.tsx # チャットUI
│   │   └── page.tsx
│   └── lib/
│       ├── auth/
│       │   ├── oauth-handoff.ts      # OAuth Handoff フロー
│       │   ├── token-store.ts        # トークン保存
│       │   └── claude-code-client.ts # Claude Code API クライアント
│       └── setup/
│           ├── agent.ts              # Agent SDK ラッパー
│           └── session-store.ts      # セッション管理
```

## トラブルシューティング

### 認証が失敗する

- `ANTHROPIC_API_KEY` が正しく設定されているか確認
- `CLAUDE_CODE_API_BASE_URL` が正しいエンドポイントを指しているか確認

### チャットが動作しない

- 認証が完了しているか確認（右上に緑のインジケータが表示される）
- ブラウザのコンソールでエラーを確認

### ファイルが編集されない

- Agent SDK のパーミッション設定を確認
- `site/` ディレクトリ内のファイルのみ操作可能です

## ライセンス

MIT
