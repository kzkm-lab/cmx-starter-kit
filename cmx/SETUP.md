# CMX Starter Kit Setup Guide

Complete setup guide for deploying your CMX-powered website with custom components.

## Prerequisites

- GitHub account
- CMX Admin API access
- Node.js 20+ and pnpm installed

## Step 1: Clone the Starter Kit

```bash
git clone https://github.com/yourusername/cmx-starter-kit.git my-website
cd my-website
pnpm install
```

## Step 2: Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values:
   ```env
   # CMX API Configuration
   CMX_API_KEY=your_api_key_here
   CMX_API_URL=https://your-cmx-admin.example.com

   # Optional: Workspace ID (auto-detected if not provided)
   # CMX_WORKSPACE_ID=your_workspace_id

   # Next.js Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### Getting Your CMX API Key

1. Log in to your CMX Admin dashboard
2. Navigate to **Settings → API Keys**
3. Click **Create New API Key**
4. Give it a descriptive name (e.g., "My Website Production")
5. Copy the generated API key
6. Paste it into your `.env` file as `CMX_API_KEY`

### CMX API URL

Your CMX API URL is the base URL of your CMX Admin installation:
- Production: `https://admin.yourdomain.com`
- Staging: `https://staging-admin.yourdomain.com`

## Step 3: GitHub Repository Setup

1. Create a new GitHub repository for your website
2. Push your local code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/my-website.git
   git push -u origin main
   ```

## Step 4: Configure GitHub Secrets

To enable automatic custom component synchronization, you need to configure GitHub Secrets:

### Required Secrets

1. **CMX_API_KEY**
   - Your CMX Admin API key (from Step 2)
   - Used to authenticate component sync requests

2. **CMX_API_URL**
   - Your CMX Admin base URL (from Step 2)
   - Used to determine where to send component definitions

### How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

   **Secret 1:**
   - Name: `CMX_API_KEY`
   - Value: Your CMX API key
   - Click **Add secret**

   **Secret 2:**
   - Name: `CMX_API_URL`
   - Value: Your CMX Admin URL (e.g., `https://admin.yourdomain.com`)
   - Click **Add secret**

### Verify Secrets

After adding secrets, you should see them listed under "Repository secrets":
- ✓ CMX_API_KEY
- ✓ CMX_API_URL

**Note:** Secret values are masked and cannot be viewed after creation. If you need to update them, you must delete and recreate them.

## Step 5: Custom Components

### Create Component Definitions

Create JSON files in `cmx/components/` to define your custom components:

```json
// cmx/components/feature-card.json
{
  "name": "FeatureCard",
  "displayName": "Feature Card",
  "description": "A card component for displaying features",
  "category": "content",
  "environment": "production",
  "propsSchema": {
    "title": {
      "type": "string",
      "description": "Feature title",
      "required": true
    },
    "description": {
      "type": "string",
      "description": "Feature description",
      "required": true
    },
    "icon": {
      "type": "string",
      "description": "Icon name",
      "optional": true
    }
  },
  "examples": [
    "title=\"Fast Performance\" description=\"Built for speed\" icon=\"zap\"",
    "title=\"Easy to Use\" description=\"Simple and intuitive\""
  ]
}
```

### Implement the Component

Create the actual React component in `src/components/custom/`:

```tsx
// src/components/custom/FeatureCard.tsx
export function FeatureCard({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  return (
    <div className="feature-card">
      {icon && <span className="icon">{icon}</span>}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

### Export the Component

Add it to the exports file:

```tsx
// src/components/custom/index.ts
export { FeatureCard } from './FeatureCard'
```

## Step 6: Component Sync Workflow

The GitHub Actions workflow (`.github/workflows/sync-components.yml`) automatically:

1. **On Push to Main/Develop:**
   - Syncs component definitions to production/staging environment
   - Updates component registry in CMX Admin

2. **On Pull Request:**
   - Creates a preview environment (`preview/pr-123`)
   - Syncs components to preview environment
   - Comments on PR with sync status

3. **On PR Close:**
   - Cleans up preview environment
   - Removes preview-specific components

### Manual Sync

You can also sync components manually:

```bash
# Sync to production
pnpm sync-components production

# Sync to staging
pnpm sync-components staging

# Sync to custom environment
pnpm sync-components preview/feature-x
```

## Step 7: Deploy Your Site

### Deploy to Cloudflare Pages

1. Build your site:
   ```bash
   pnpm build:cf
   ```

2. Deploy:
   ```bash
   pnpm deploy
   ```

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Deploy to Netlify

1. Build your site:
   ```bash
   pnpm build
   ```

2. Deploy the `.next` directory

## Step 8: Verify Setup

1. Visit your deployed site
2. Create a new post in CMX Admin
3. Use your custom components in the MDX content:
   ```mdx
   # My Post

   <FeatureCard
     title="Amazing Feature"
     description="This is a custom component"
     icon="star"
   />
   ```

4. Preview and publish the post
5. Verify the component renders correctly on your site

## Troubleshooting

### Component Sync Fails

**Problem:** GitHub Actions workflow fails with authentication error

**Solution:**
1. Verify `CMX_API_KEY` and `CMX_API_URL` secrets are set correctly
2. Check that the API key has the necessary permissions
3. Ensure the API URL is accessible from GitHub Actions

### Components Not Available

**Problem:** Custom components don't appear in CMX Admin

**Solution:**
1. Check that component JSON files are in `cmx/components/`
2. Verify the JSON syntax is valid
3. Run `pnpm sync-components` manually to see detailed error messages
4. Check that the environment matches (production/staging/preview)

### Component Not Rendering

**Problem:** Component shows in editor but doesn't render on site

**Solution:**
1. Verify the component is exported in `src/components/custom/index.ts`
2. Check browser console for errors
3. Ensure props match the schema definition
4. Verify component implementation has no TypeScript errors

## Environment Strategy

### Production
- Branch: `main`
- Environment: `production`
- Use for: Released, stable components

### Staging
- Branch: `develop`
- Environment: `staging`
- Use for: Testing components before production release

### Preview
- Branch: `feature/*`, `fix/*`
- Environment: `preview/pr-{number}`
- Use for: Testing components in pull requests
- Automatically cleaned up when PR is closed

## Best Practices

1. **Test in Preview First**
   - Create a PR to test components in preview environment
   - Verify component works as expected
   - Merge to develop for staging testing
   - Finally merge to main for production

2. **Component Naming**
   - Use PascalCase for component names (e.g., `FeatureCard`)
   - Use descriptive names that indicate purpose
   - Avoid generic names like `Component1`

3. **Schema Definitions**
   - Always include descriptions for props
   - Mark required props explicitly
   - Provide examples for common use cases

4. **Version Control**
   - Commit component definitions and implementations together
   - Include component changes in PR descriptions
   - Document breaking changes in commit messages

## Next Steps

- [Component API Reference](./COMPONENTS.md)
- [Styling Guide](./STYLING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [CMX Documentation](https://github.com/yourusername/cmx)

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/yourusername/cmx/issues)
3. Join our [Discord Community](https://discord.gg/cmx)
