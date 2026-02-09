# Customization Guide

Complete guide to customizing your CMX Starter Kit.

## Table of Contents

- [Styling](#styling)
- [Layout](#layout)
- [Pages](#pages)
- [Components](#components)
- [Data Fetching](#data-fetching)
- [SEO & Metadata](#seo--metadata)
- [Environment Variables](#environment-variables)

## Styling

### Tailwind CSS Configuration

The starter kit uses Tailwind CSS v4. Customize your design system in `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add your brand colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... more shades
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        // Add custom fonts
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

### Custom Fonts

Add custom fonts in `src/app/layout.tsx`:

```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### Global Styles

Add global CSS in `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Custom base styles */
  h1 {
    @apply text-4xl font-bold mb-4;
  }

  h2 {
    @apply text-3xl font-semibold mb-3;
  }

  /* MDX component styles */
  .cmx-mdx__callout {
    @apply my-6 p-5 rounded-lg border;
  }

  .cmx-mdx__callout--info {
    @apply bg-blue-50 border-blue-200;
  }
}

@layer components {
  /* Custom component classes */
  .btn-primary {
    @apply bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700;
  }
}
```

## Layout

### Header Customization

Edit `src/components/layout/Header.tsx`:

```tsx
export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="font-bold text-xl">
            Your Brand
          </a>

          {/* Navigation */}
          <div className="flex gap-6">
            <a href="/blog" className="hover:text-brand-600">
              Blog
            </a>
            <a href="/about" className="hover:text-brand-600">
              About
            </a>
            <a href="/contact" className="hover:text-brand-600">
              Contact
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
```

### Footer Customization

Edit `src/components/layout/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold mb-4">Your Company</h3>
            <p className="text-sm text-gray-600">
              Building amazing products since 2024.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/features">Features</a></li>
              <li><a href="/pricing">Pricing</a></li>
            </ul>
          </div>

          {/* More columns... */}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          © 2024 Your Company. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
```

## Pages

### Creating New Pages

Create a new page in `src/app/`:

```tsx
// src/app/features/page.tsx
export const metadata = {
  title: 'Features',
  description: 'Discover our amazing features',
}

export default function FeaturesPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1>Features</h1>
      <p>Your content here...</p>
    </main>
  )
}
```

### Dynamic Routes

Create dynamic routes with `[param]` folders:

```tsx
// src/app/products/[slug]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)

  return (
    <main>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
    </main>
  )
}
```

### Blog with CMX

The blog is already set up with CMX:

```tsx
// src/app/blog/page.tsx
import { getCollectionPosts } from '@cmx/api-client/public'

export default async function BlogPage() {
  const posts = await getCollectionPosts('blog')

  return (
    <main>
      <h1>Blog</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.slug}>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <a href={`/blog/${post.slug}`}>Read more</a>
          </article>
        ))}
      </div>
    </main>
  )
}
```

## Components

### Creating Reusable Components

Create components in `src/components/`:

```tsx
// src/components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'error'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${variants[variant]}`}>
      {children}
    </span>
  )
}
```

### Using shadcn/ui Components

Install shadcn/ui components:

```bash
pnpm dlx shadcn-ui@latest add button
```

Then use them:

```tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <Button>Click me</Button>
}
```

## Data Fetching

### CMX API Client

Use the type-safe API client:

```tsx
import {
  getCollectionPosts,
  getCollectionPost,
} from '@cmx/api-client/public'

// List posts
const posts = await getCollectionPosts('blog', {
  page: 1,
  limit: 10,
})

// Get single post
const post = await getCollectionPost('blog', 'my-post-slug')
```

### Custom API Routes

Create API routes in `src/app/api/`:

```tsx
// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  // Your logic here
  await subscribeToNewsletter(email)

  return NextResponse.json({ success: true })
}
```

### Data Caching

Use Next.js caching strategies:

```tsx
// Revalidate every hour
export const revalidate = 3600

export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  })

  return <div>{/* ... */}</div>
}
```

## SEO & Metadata

### Page Metadata

Export metadata from pages:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.jpg'],
  },
}
```

### Dynamic Metadata

Generate metadata from data:

```tsx
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.featuredImage],
    },
  }
}
```

### Sitemap

Generate a sitemap:

```tsx
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { getCollectionPosts } from '@cmx/api-client/public'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getCollectionPosts('blog')

  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `https://yourdomain.com/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
```

### Robots.txt

Configure robots.txt:

```tsx
// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  }
}
```

## Environment Variables

### Adding New Variables

Add to `.env.example`:

```env
# Your custom variables
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
```

### Using in Server Components

```tsx
const apiKey = process.env.SENDGRID_API_KEY
```

### Using in Client Components

Prefix with `NEXT_PUBLIC_`:

```tsx
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
```

### Type-Safe Environment Variables

Create types in `src/env.d.ts`:

```tsx
declare namespace NodeJS {
  interface ProcessEnv {
    CMX_API_KEY: string
    CMX_API_URL: string
    STRIPE_SECRET_KEY: string
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: string
  }
}
```

## Advanced Customization

### Middleware

Add middleware for auth, redirects, etc:

```tsx
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Your logic here
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check auth, etc.
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### Custom MDX Components

Add custom MDX components:

```tsx
// src/lib/mdx/render.tsx
import { MDXRender as BaseMDXRender } from '@cmx/mdx/render'
import { ComponentCatalog } from '@cmx/mdx/component-catalog'
import { YourCustomComponent } from '@/components/custom/YourCustomComponent'

const customComponents = {
  ...ComponentCatalog,
  YourCustomComponent,
}

export function MDXRender({ content }: { content: string }) {
  return <BaseMDXRender content={content} components={customComponents} />
}
```

### Analytics

Add analytics tracking:

```tsx
// src/app/layout.tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  )
}
```

## Best Practices

1. **Keep Components Small** - Single responsibility principle
2. **Use TypeScript** - Catch errors early
3. **Server Components by Default** - Only use client components when needed
4. **Optimize Images** - Use Next.js Image component
5. **Cache Appropriately** - Use ISR and cache tags
6. **Test Components** - Write tests for critical components
7. **Document Changes** - Keep docs up to date

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [CMX Documentation](https://github.com/yourusername/cmx)
