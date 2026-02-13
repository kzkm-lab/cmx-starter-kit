import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google"
import "./globals.css"
import { Header, Footer } from "@/components/layout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CMX Demo Site",
    template: "%s | CMX",
  },
  description: "AI-first MDX CMS - CMXデモサイト",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "CMX Demo Site",
  },
  twitter: {
    card: "summary",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
