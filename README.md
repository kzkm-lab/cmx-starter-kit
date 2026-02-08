# CMX Starter Kit

A Next.js starter template for building content-driven websites with CMX (Content Management Experience).

## Features

- 🚀 **Next.js 15+** - Modern React framework with App Router
- 📝 **MDX Support** - Rich content with React components
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Custom Components** - Extend with your own components
- 🔄 **Auto-Sync** - Automatic component sync with CMX Admin
- 🌍 **Multi-Environment** - Support for production, staging, and preview
- ⚡ **Cloudflare Ready** - Optimized for Cloudflare Pages

## Quick Start

### 1. Clone this repository

```bash
git clone https://github.com/YOUR-ORG/cmx-starter-kit.git
cd cmx-starter-kit
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
# Required
CMX_API_KEY=your_api_key_here
CMX_API_URL=https://your-cmx-admin.example.com

# Optional
CMX_WORKSPACE_ID=your_workspace_id
```

### 4. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Custom Components

### Adding a Custom Component

1. **Create component definition** in `.cmx/components/`:

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
