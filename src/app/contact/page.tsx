import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"
import { fetchPublishedContent } from "@/lib/api/public-client"
import { renderMdx } from "@/lib/mdx/render"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "./contact-form"
import { SITE_INFO } from "@/lib/constants/site"

// ISR: 60秒キャッシュ + オンデマンド再検証（/api/revalidate）
export const revalidate = 60

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "CMXへのお問い合わせ",
  openGraph: {
    title: "お問い合わせ",
    description: "CMXへのお問い合わせ",
    url: "/contact",
  },
}

export default async function ContactPage() {
  // pagesコレクションからcontactページのコンテンツを取得（失敗時はビルドエラー）
  const data = await fetchPublishedContent("pages", "contact")
  if (!data) {
    throw new Error("Failed to fetch contact page content from pages/contact")
  }
  const { content: pageContent } = await renderMdx(data.content.mdx, data.references)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">お問い合わせ</h1>
          <p className="text-lg text-muted-foreground">
            ご質問・ご相談がございましたら、お気軽にお問い合わせください。
          </p>
        </header>

        {/* ページコンテンツ（MDX） */}
        <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
          {pageContent}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* お問い合わせフォーム */}
          <div className="md:col-span-2">
            <ContactForm />
          </div>

          {/* 連絡先情報 — src/lib/constants/site.ts で編集 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">連絡先</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">メール</p>
                    <p className="text-sm text-muted-foreground">
                      {SITE_INFO.contact.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">電話</p>
                    <p className="text-sm text-muted-foreground">
                      {SITE_INFO.contact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">所在地</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {`${SITE_INFO.contact.postalCode}\n${SITE_INFO.contact.address}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">営業時間</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {SITE_INFO.contact.businessHours}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
