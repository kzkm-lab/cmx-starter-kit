# CMX Starter Kit

A Next.js starter template for building content-driven websites with CMX (Content Management Experience).

## Project Structure

このプロジェクトは2つのワークスペースで構成されています：

```
cmx-starter-kit/
├── site/          # 公開サイト（Next.js）
│   ├── src/       # アプリケーションコード
│   ├── cmx/       # CMX設定・生成コード
│   └── package.json
│
├── dev/           # 開発UI（セットアップ）
│   ├── src/       # セットアップチャットUI
│   └── package.json
│
├── .claude/       # Claude Code スキル・コマンド
├── workflows/     # ライター向けワークフロー
└── pnpm-workspace.yaml
```

### site/ — 公開サイト

実際のWebサイトのコードです。CMX SDKを使ってコンテンツを取得し、MDXをレンダリングします。

### dev/ — 開発UI（セットアップ）

AIと対話しながらサイトをセットアップできる開発用UIです。Agent SDKを使って`site/`ディレクトリを操作し、スキーマ設計からページ実装まで自動化します。

**注意**: 開発UIは`site/`のみを操作対象とし、`dev/`のコードには触れません。

## Features

- 🚀 **Next.js 15+** - Modern React framework with App Router
- 📝 **MDX Support** - Rich content with React components
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Custom Components** - Extend with your own components
- 🔄 **Auto-Sync** - Automatic component sync with CMX Admin
- 🌍 **Multi-Environment** - Support for production, staging, and preview
- ⚡ **Cloudflare Ready** - Optimized for Cloudflare Pages

## Quick Start

### 方法A: セットアップUI（推奨）

AIと対話しながらサイトを構築します。

1. **依存関係をインストール**

   ```bash
   pnpm install
   ```

2. **開発サーバーを起動**

   ```bash
   pnpm dev
   ```

   2つのサーバーが起動します：
   - **セットアップUI**: [http://localhost:4001](http://localhost:4001)
   - **公開サイト**: [http://localhost:4000](http://localhost:4000)

3. **セットアップUIにアクセス**

   [http://localhost:4001](http://localhost:4001) を開き、AIと対話しながらサイトをセットアップします。

   必要なもの：
   - Anthropic API Key（Agent SDK用）
   - CMX API Key（コンテンツ管理用）

### 方法B: 手動セットアップ

Claude Codeのスラッシュコマンドで手動セットアップすることも可能です。

1. **依存関係をインストール**

   ```bash
   pnpm install
   ```

2. **Claude Codeで `/setup/start` を実行**

   状態を自動判定し、適切なステップへ案内されます。

3. **サイトを起動**

   ```bash
   pnpm dev:site
   ```

   [http://localhost:4000](http://localhost:4000) でサイトが起動します。

## Custom Components

### Adding a Custom Component

1. **Create component definition** in `cmx/components/`:

```json
{
  "name": "TeamMember",
  "displayName": "Team Member Card",
  "description": "Display team member information with avatar and bio",
  "environment": "production",
  "propsSchema": {
    "name": {
      "type": "string",
      "description": "Team member's name",
      "required": true
    },
    "role": {
      "type": "string",
      "description": "Job title or role",
      "required": true
    },
    "avatar": {
      "type": "string",
      "description": "Avatar image URL",
      "required": false
    },
    "bio": {
      "type": "string",
      "description": "Short bio",
      "required": false
    }
  },
  "examples": [
    "<TeamMember name=\"John Doe\" role=\"Software Engineer\" avatar=\"/images/john.jpg\" bio=\"Loves building great products\" />"
  ]
}
```

2. **Implement the component** in `src/components/custom/`:

```tsx
// src/components/custom/TeamMember.tsx
interface TeamMemberProps {
  name: string
  role: string
  avatar?: string
  bio?: string
}

export function TeamMember({ name, role, avatar, bio }: TeamMemberProps) {
  return (
    <div className="border rounded-lg p-6">
      {avatar && (
        <img src={avatar} alt={name} className="w-20 h-20 rounded-full mb-4" />
      )}
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-gray-600">{role}</p>
      {bio && <p className="mt-2 text-sm">{bio}</p>}
    </div>
  )
}
```

3. **Export the component** in `src/components/custom/index.ts`:

```tsx
export { TeamMember } from './TeamMember'
```

4. **Sync with CMX Admin**:

```bash
pnpm sync-components
```

Or push to your branch - GitHub Actions will automatically sync components.

## Environment-Specific Components

Components can be deployed to different environments:

- `production` - Available in production only
- `staging` - Available in staging only
- `preview/*` - Available in specific preview environments

Set the `environment` field in your component definition JSON.

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables:
   - `CMX_API_KEY`
   - `CMX_API_URL`
3. Deploy!

### Cloudflare Pages

1. Build for Cloudflare:
   ```bash
   pnpm build:cf
   ```

2. Deploy:
   ```bash
   pnpm deploy
   ```

## Documentation

- [CMX Documentation](https://docs.cmx.example.com)
- [Custom Components Guide](./docs/custom-components.md)
- [API Reference](./docs/api-reference.md)

## License

MIT
