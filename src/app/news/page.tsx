import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CalendarDays } from "lucide-react"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchPosts } from "@/lib/utils/data-fetching"
import { generateCollectionMetadata } from "@/lib/utils/metadata"
import { formatPostDate } from "@/lib/utils/date"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return generateCollectionMetadata(COLLECTION_SLUGS.news)
}

export default async function NewsListPage() {
  const { collection, posts } = await requireFetchPosts(COLLECTION_SLUGS.news)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-lg text-muted-foreground">{collection.description}</p>
          )}
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>まだニュースがありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {post.publishedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <CalendarDays className="h-4 w-4" />
                      <time dateTime={post.publishedAt} className="min-w-[100px]">
                        {formatPostDate(post.publishedAt, "simple")}
                      </time>
                    </div>
                  )}
                  <span className="font-medium group-hover:text-primary transition-colors truncate">
                    {post.title}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
