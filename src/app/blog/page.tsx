import Link from "next/link"
import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchPosts } from "@/lib/utils/data-fetching"
import { generateCollectionMetadata } from "@/lib/utils/metadata"
import { formatPostDate } from "@/lib/utils/date"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return generateCollectionMetadata(COLLECTION_SLUGS.blog)
}

export default async function BlogListPage() {
  const { collection, posts } = await requireFetchPosts(COLLECTION_SLUGS.blog)

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
            <p>まだ記事がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    {post.publishedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <time dateTime={post.publishedAt}>
                          {formatPostDate(post.publishedAt)}
                        </time>
                      </div>
                    )}
                  </CardHeader>
                  {post.description && (
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {post.description}
                      </CardDescription>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
