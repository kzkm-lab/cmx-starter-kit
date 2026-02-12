import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { renderMdx } from "@/lib/mdx/render"
import { Button } from "@/components/ui/button"
import { BackToList } from "@/components/public/back-to-list"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchContent } from "@/lib/utils/data-fetching"
import { generateContentMetadata } from "@/lib/utils/metadata"
import { formatContentDate } from "@/lib/utils/date"

// ISR: 60秒キャッシュ + オンデマンド再検証（/api/revalidate）
export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return generateContentMetadata(COLLECTION_SLUGS.news, slug)
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const { collection, content, references } = await requireFetchContent(COLLECTION_SLUGS.news, slug)
  const { content: renderedContent } = await renderMdx(content.mdx, references)

  return (
    <article className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {collection.name}に戻る
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {content.title}
          </h1>

          {content.publishedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={content.publishedAt}>
                {formatContentDate(content.publishedAt)}
              </time>
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {renderedContent}
        </div>

        <BackToList href="/news" label="ニュース一覧に戻る" />
      </div>
    </article>
  )
}
