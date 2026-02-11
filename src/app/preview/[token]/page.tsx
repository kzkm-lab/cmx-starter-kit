import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, Eye, AlertTriangle } from "lucide-react"
import { getPreviewByToken } from "@/lib/api/admin-client"
import { renderMdx } from "@/lib/mdx/render"
import { Button } from "@/components/ui/button"

// キャッシュ無効
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const data = await getPreviewByToken(token)

  if (!data) {
    return {
      title: "プレビューが見つかりません | CMX",
    }
  }

  return {
    title: `[プレビュー] ${data.content.title} | CMX`,
    description: data.content.description || undefined,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function PreviewPage({ params }: PageProps) {
  const { token } = await params
  const data = await getPreviewByToken(token)

  if (!data) {
    notFound()
  }

  const { content, collection, references } = data

  // renderMdxはReferences型を期待するが、PreviewReferencesと互換
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { content: renderedContent } = await renderMdx(content.mdx, references as any)

  return (
    <article className="container mx-auto px-4 py-12">
      {/* プレビューバナー */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100/80 backdrop-blur-sm border-b border-amber-200 py-1.5 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2 text-xs text-amber-700">
          <Eye className="h-3 w-3" />
          <span>プレビューモード</span>
          {content.environment !== "production" && (
            <>
              <span className="mx-1.5 text-amber-300">|</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 font-medium">
                {content.environment === "staging" ? "ステージング" : content.environment}
              </span>
            </>
          )}
          {content.status !== "published" && (
            <>
              <span className="mx-1.5 text-amber-300">|</span>
              <AlertTriangle className="h-3 w-3" />
              <span>{content.status === "draft" ? "下書き" : content.status}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-12">
        <header className="mb-12">
          {collection && (
            <Button asChild variant="ghost" size="sm" className="mb-6">
              <Link href={`/${collection.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {collection.name}に戻る
              </Link>
            </Button>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {content.title}
          </h1>

          {content.description && (
            <p className="text-lg text-muted-foreground mb-4">{content.description}</p>
          )}

          {/* プレビューでは日付は表示しない（下書きには日付がないため） */}
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {renderedContent}
        </div>

        <footer className="mt-12 pt-8 border-t">
          {collection && (
            <Button asChild variant="outline">
              <Link href={`/${collection.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                記事一覧に戻る
              </Link>
            </Button>
          )}
        </footer>
      </div>
    </article>
  )
}
