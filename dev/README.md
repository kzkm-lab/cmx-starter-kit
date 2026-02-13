# CMX Starter Kit - Setup UI

AI アシスタントによるインタラクティブなセットアップUIです。

## 機能

- **Claude Code 統合**: Claude Code CLI (`npx @anthropic-ai/claude-code`) を使用したファイル操作・コード生成
- **AI チャット**: リアルタイムストリーミングで AI とやり取り
- **安全な操作範囲**: `site/` ディレクトリのみを操作対象に制限
- **API キー不要**: Claude Code のサブスクリプション認証のみで動作

## 前提条件

**Claude Code にログイン済みであること**

Setup UI を使用する前に、ターミナルで Claude Code にログインしてください：

```bash
claude-code login
```

これにより `~/.claude.json` に認証情報が保存され、Setup UI から Claude Code CLI を使用できるようになります。

## セットアップ

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

→ http://localhost:4001 でアクセス

### 3. ログイン状態の確認

ブラウザで Setup UI を開くと、右上にログイン状態が表示されます：
- **緑色**: ログイン済み（使用可能）
- **赤色**: 未ログイン（`claude-code login` を実行してください）

## 使い方

認証完了後、チャット入力欄にメッセージを送信します。

**例:**
- 「サイトをセットアップしてください」
- 「ヘッダーのロゴを変更してください」
- 「ブログページを作成してください」

AI アシスタントが `site/` ディレクトリ内のファイルを自動で編集・作成します。

## アーキテクチャ

### 認証

- **事前ログイン方式**: `claude-code login` で事前にログイン
- **トークンストレージ**: `~/.claude.json` に保存（Claude Code CLI が自動で読み込む）

### Claude Code CLI 統合

- **CLI ラッパー**: `npx @anthropic-ai/claude-code` を spawn で起動
- **JSON ストリーム通信**: stdin/stdout で Claude Code CLI とやり取り
- **セッション管理**: メモリベースのセッションストア（10分で自動削除）
- **ストリーミング**: SSE による応答のリアルタイム表示
- **サブスクリプション認証**: Claude Code のサブスクリプションのみで動作（API キー不要）

### ファイル構成

```
dev/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── status/      # ログイン状態確認
│   │   │   └── setup/
│   │   │       └── chat/        # Claude Code CLI チャット
│   │   ├── _components/
│   │   │   ├── auth-status.tsx  # ログイン状態表示
│   │   │   └── chat-interface.tsx # チャットUI
│   │   └── page.tsx
│   └── lib/
│       └── setup/
│           ├── claude-code-cli.ts    # Claude Code CLI ラッパー
│           ├── agent.ts              # エージェント統合
│           └── session-store.ts      # セッション管理
```

## トラブルシューティング

### 未ログインと表示される

- ターミナルで `claude-code login` を実行してログインしてください
- `~/.claude.json` が存在することを確認してください
- ログイン後、ブラウザをリロードしてください

### チャットが動作しない

- ログイン済み（右上に緑のインジケータ）であることを確認
- ブラウザのコンソールでエラーを確認
- ターミナルで Setup UI のログを確認

### ファイルが編集されない

- `site/` ディレクトリが存在することを確認
- `site/` ディレクトリ内のファイルのみ操作可能です
- `npx @anthropic-ai/claude-code` が正しく実行できることを確認

## ライセンス

MIT
