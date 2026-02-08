import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"
import { fetchPublishedContent } from "@/lib/api/public-client"
import { renderMdx } from "@/lib/mdx/render"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "お問い合わせ | CMX",
  description: "CMXへのお問い合わせ",
}

export default async function ContactPage() {
  // pagesコレクションからcontactページのコンテンツを取得（失敗時はビルドエラー）
  const data = await fetchPublishedContent("pages", "contact")
  if (!data) {
    throw new Error("Failed to fetch contact page content from pages/contact")
  }
  const { content: pageContent } = await renderMdx(data.post.mdx, data.references)

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
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせフォーム</CardTitle>
                <CardDescription>
                  以下のフォームに必要事項をご記入ください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">お名前 *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="山田 太郎"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">会社名</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="株式会社〇〇"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">件名 *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="お問い合わせの件名"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">お問い合わせ内容 *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="お問い合わせ内容をご記入ください"
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    送信する
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    ※ このフォームはデモ用です。実際の送信機能は実装されていません。
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 連絡先情報 */}
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
                      info@example.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">電話</p>
                    <p className="text-sm text-muted-foreground">
                      03-1234-5678
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">所在地</p>
                    <p className="text-sm text-muted-foreground">
                      〒100-0001<br />
                      東京都千代田区1-1-1<br />
                      サンプルビル 10F
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
                <p className="text-sm text-muted-foreground">
                  平日 9:00 - 18:00<br />
                  土日祝日は休業
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
