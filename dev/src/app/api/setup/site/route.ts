import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const SITE_CONFIG_PATH = path.join(
  process.cwd(),
  "../site/cmx/site-config.md"
)

type SiteConfig = {
  siteName?: string
  siteUrl?: string
  language?: string
  siteType?: string
}

const SITE_TYPE_MAP: Record<string, string> = {
  corporate: "コーポレート",
  blog: "ブログ",
  lp: "LP",
  ec: "EC",
  docs: "ドキュメント",
  media: "メディア",
}

/**
 * site-config.md からサイト設定を読み取る
 */
async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const content = await fs.readFile(SITE_CONFIG_PATH, "utf-8")

    const config: SiteConfig = {}

    // サイト名を抽出
    const siteNameMatch = content.match(/- \*\*サイト名\*\*: (.+)/)
    if (siteNameMatch) {
      const value = siteNameMatch[1].trim()
      if (value !== "（未設定）") {
        config.siteName = value
      }
    }

    // URLを抽出
    const urlMatch = content.match(/- \*\*URL\*\*: (.+)/)
    if (urlMatch) {
      const value = urlMatch[1].trim()
      if (value !== "（未設定）") {
        config.siteUrl = value
      }
    }

    // 言語を抽出
    const languageMatch = content.match(/- \*\*言語\*\*: (.+)/)
    if (languageMatch) {
      config.language = languageMatch[1].trim()
    }

    // サイト種別を抽出
    const siteTypeMatch = content.match(/- \*\*サイト種別\*\*: (.+)/)
    if (siteTypeMatch) {
      const value = siteTypeMatch[1].trim()
      // 日本語表記から英語のキーに変換
      const typeKey = Object.entries(SITE_TYPE_MAP).find(
        ([_, label]) => label === value
      )?.[0]
      if (typeKey) {
        config.siteType = typeKey
      }
    }

    return config
  } catch (error) {
    console.error("Failed to read site-config.md:", error)
    return {}
  }
}

/**
 * site-config.md にサイト設定を書き込む
 */
async function writeSiteConfig(config: SiteConfig): Promise<void> {
  try {
    let content = await fs.readFile(SITE_CONFIG_PATH, "utf-8")

    // サイト名を更新
    if (config.siteName) {
      content = content.replace(
        /- \*\*サイト名\*\*: .+/,
        `- **サイト名**: ${config.siteName}`
      )
    }

    // URLを更新
    if (config.siteUrl) {
      content = content.replace(
        /- \*\*URL\*\*: .+/,
        `- **URL**: ${config.siteUrl}`
      )
    }

    // 言語を更新
    if (config.language) {
      content = content.replace(
        /- \*\*言語\*\*: .+/,
        `- **言語**: ${config.language}`
      )
    }

    // サイト種別を更新
    if (config.siteType) {
      const typeLabel = SITE_TYPE_MAP[config.siteType] || config.siteType
      content = content.replace(
        /- \*\*サイト種別\*\*: .+/,
        `- **サイト種別**: ${typeLabel}`
      )
    }

    await fs.writeFile(SITE_CONFIG_PATH, content, "utf-8")
  } catch (error) {
    console.error("Failed to write site-config.md:", error)
    throw new Error("サイト設定の保存に失敗しました")
  }
}

/**
 * GET /api/setup/site
 * サイト設定を取得
 */
export async function GET() {
  try {
    const config = await readSiteConfig()
    return NextResponse.json({ config })
  } catch (error) {
    console.error("Failed to get site config:", error)
    return NextResponse.json(
      { error: "サイト設定の取得に失敗しました" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/setup/site
 * サイト設定を保存
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const config: SiteConfig = {
      siteName: body.siteName,
      siteUrl: body.siteUrl,
      language: body.language || "ja",
      siteType: body.siteType,
    }

    await writeSiteConfig(config)

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("Failed to save site config:", error)
    return NextResponse.json(
      { error: "サイト設定の保存に失敗しました" },
      { status: 500 }
    )
  }
}
