import Link from "next/link"
import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { COLLECTION_SLUGS } from "@/lib/constants/collections"
import { requireFetchContents } from "@/lib/utils/data-fetching"
import { generateCollectionMetadata } from "@/lib/utils/metadata"
import { formatContentDate } from "@/lib/utils/date"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return generateCollectionMetadata(COLLECTION_SLUGS.blog)
}

export default async function BlogListPage() {
  const { collection, contents } = await requireFetchContents(COLLECTION_SLUGS.blog)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-lg text-muted-foreground">{collection.description}</p>
          )}
        </header>

        {contents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>まだ記事がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contents.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="group">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                    {item.publishedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <time dateTime={item.publishedAt}>
                          {formatContentDate(item.publishedAt)}
                        </time>
                      </div>
                    )}
                  </CardHeader>
                  {item.description && (
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {item.description}
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
