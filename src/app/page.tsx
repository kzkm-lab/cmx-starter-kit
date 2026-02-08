import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCollectionPosts, getDataEntries } from "@/lib/api/admin-client"

// ランタイムでデータを取得（ビルド時はスキップ）
export const dynamic = "force-dynamic"

// サービスアイコンのマッピング
const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  shield: <Shield className="h-8 w-8" />,
}

interface ServiceEntry {
  id: string
  title?: string
  description?: string
  icon?: string
}

export default async function Home() {
  // 最新ニュース取得（失敗時はビルドエラー）
  const newsData = await getCollectionPosts("news")
  if (!newsData) {
    throw new Error("Failed to fetch news posts")
  }
  const newsItems = newsData.posts.slice(0, 3)

  // サービス一覧取得（失敗時はビルドエラー）
  const servicesData = await getDataEntries("services", { limit: 3 })
  if (!servicesData) {
    throw new Error("Failed to fetch services data")
  }
  const services = servicesData.items as unknown as ServiceEntry[]

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Hero Section - White Theme with Abstract SVG */}
      <section className="relative overflow-hidden bg-white min-h-[640px] flex items-center border-b border-slate-100">
        {/* Background SVG - Positioned on right */}
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full opacity-60 pointer-events-none">
          <img src="/hero-pattern.svg" alt="" className="w-full h-full object-cover object-right opacity-80" />
        </div>
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
        
        <div className="container relative mx-auto px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl relative z-10">
            <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800 mb-6 border border-slate-200">
               New Generation CMS
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight text-slate-900">
              Digital Experience, <br/>
              <span className="text-slate-500">Redefined.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed font-jp">
              AIエージェントが、あなたのコンテンツ運用を革新します。<br/>
              煩雑な作業を自動化し、創造的な仕事に集中できる環境を。
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800 text-base px-8 h-12 rounded-none font-jp">
                <Link href="/contact">
                  無料で始める
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-base px-8 h-12 rounded-none font-jp">
                <Link href="/about">CMXについて</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Minimalist grayscale */}
      <section className="py-12 border-b border-slate-100 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos - using text for demo */}
            {["Acme Corp", "Global Tech", "Nebula Systems", "Vertex Inc", "Horizon Group"].map((company) => (
              <span key={company} className="text-xl font-bold text-slate-800 select-none font-serif italic">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Services Section - Clean Cards */}
      {services.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Capabilities</h2>
              <p className="text-3xl font-bold text-slate-900 mb-4 sm:text-4xl tracking-tight">
                Designed for Focus
              </p>
              <p className="text-lg text-slate-600 font-light font-jp">
                ビジネスを加速させるための本質的な機能だけを、シンプルに。
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {services.map((service) => (
                <Card key={service.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                  <CardHeader>
                    <div className="mb-6 p-3 bg-slate-50 border border-slate-100 w-fit text-slate-700">
                      {iconMap[service.icon || "sparkles"] || <Sparkles className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-xl mb-2 text-slate-900 font-bold">{service.title || "Service"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-slate-600 font-jp">
                      {service.description || "サービスの詳細説明がここに入ります。"}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News Section - Minimal Grid */}
      {newsItems.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Journal</h2>
                <p className="text-slate-500 font-light font-jp">最新のアップデートとインサイト</p>
              </div>
              <Button asChild variant="ghost" className="text-slate-900 hover:bg-slate-50 hover:text-slate-900 rounded-none font-jp">
                <Link href="/news">
                  すべて見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {newsItems.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="group block">
                  <article className="h-full flex flex-col">
                    <div className="aspect-[16/9] bg-slate-100 mb-6 relative overflow-hidden">
                       {/* Abstract placeholder for post image */}
                       <div className="absolute inset-0 bg-slate-200" />
                       <div className="absolute bottom-0 left-0 p-4 bg-white/90 backdrop-blur-sm border-t border-r border-slate-200">
                          {item.publishedAt && (
                            <time className="text-xs font-bold text-slate-500">
                              {new Date(item.publishedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                            </time>
                          )}
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-600 transition-colors mb-3 leading-snug font-jp">
                      {item.title}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-sm font-medium text-slate-900">
                      Read Article <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-2" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Corporate CTA Section - Simple White on Gray */}
      <section className="py-32 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] bg-center opacity-5 invert grayscale" />
        <div className="container mx-auto px-6 lg:px-8 relative text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Transform?</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto text-lg font-light leading-relaxed font-jp">
            ビジネスの未来を、今すぐ体験しましょう。<br className="hidden md:block" />
            シンプルでパワフル。スケーラブルなCMSです。
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-200 h-14 px-10 rounded-none font-bold font-jp">
              <Link href="/contact">今すぐ始める</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 h-14 px-10 rounded-none bg-transparent font-jp">
              <Link href="/docs">ドキュメント</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
