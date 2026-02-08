import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { renderMdx } from "@/lib/mdx/render"
import { Button } from "@/components/ui/button"
import { BackToList } from "@/components/public/back-to-list"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchContent } from "@/lib/utils/data-fetching"
import { generatePostMetadata } from "@/lib/utils/metadata"
import { formatPostDate } from "@/lib/utils/date"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return generatePostMetadata(COLLECTION_SLUGS.blog, slug)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const { collection, post, references } = await requireFetchContent(COLLECTION_SLUGS.blog, slug)
  const { content } = await renderMdx(post.mdx, references)

  return (
    <article className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {collection.name}に戻る
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-lg text-muted-foreground mb-4">{post.description}</p>
          )}

          {post.publishedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.publishedAt}>
                {formatPostDate(post.publishedAt)}
              </time>
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {content}
        </div>

        <BackToList href="/blog" label="記事一覧に戻る" />
      </div>
    </article>
  )
}
