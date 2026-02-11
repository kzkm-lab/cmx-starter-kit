import type { Metadata } from "next"
import { fetchPublishedContent } from "@/lib/api/public-client"
import { renderMdx } from "@/lib/mdx/render"
import { getDataEntries } from "@/lib/api/admin-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "会社概要 | CMX",
  description: "CMXについて - AI-first MDX CMS",
}

interface TeamMember {
  id: string
  name?: string
  role?: string
  bio?: string
  image?: string
}

export default async function AboutPage() {
  // pagesコレクションからaboutページのコンテンツを取得（失敗時はビルドエラー）
  const data = await fetchPublishedContent("pages", "about")
  if (!data) {
    throw new Error("Failed to fetch about page content from pages/about")
  }
  const { content: pageContent } = await renderMdx(data.content.mdx, data.references)

  // チームメンバー取得（失敗時はビルドエラー）
  const teamData = await getDataEntries("team", { limit: 6 })
  const teamMembers = teamData.items as unknown as TeamMember[]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">会社概要</h1>
          <p className="text-lg text-muted-foreground">
            CMXについてご紹介します。
          </p>
        </header>

        {/* ページコンテンツ（MDX） */}
        <div className="prose prose-lg max-w-none dark:prose-invert mb-16">
          {pageContent}
        </div>

        {/* チームメンバーセクション */}
        {teamMembers.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8">チーム</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name || ""}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {(member.name || "?")[0]}
                        </span>
                      )}
                    </div>
                    <CardTitle>{member.name || "メンバー"}</CardTitle>
                    {member.role && (
                      <CardDescription>{member.role}</CardDescription>
                    )}
                  </CardHeader>
                  {member.bio && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
