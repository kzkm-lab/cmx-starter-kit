import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * Revalidation API
 *
 * キャッシュタグを指定してオンデマンドでキャッシュを無効化するAPI
 *
 * 認証: X-API-Key ヘッダー
 * 環境変数: REVALIDATE_API_KEY
 *
 * 使用例:
 * POST /api/revalidate
 * Headers: X-API-Key: your_secret_key
 * Body: { "tags": ["collection:blog"] }
 *
 * または単一タグ:
 * Body: { "tag": "collection:blog" }
 *
 * 利用可能なタグ:
 * - collections: 全コレクション
 * - collection:{slug}: 特定コレクション (例: collection:blog)
 * - post:{collection}:{slug}: 特定記事 (例: post:blog:hello-world)
 * - data: 全データタイプ
 * - data:{slug}: 特定データタイプ (例: data:services)
 */

interface RevalidateRequest {
  tag?: string
  tags?: string[]
}

export async function POST(request: NextRequest) {
  // X-API-Key認証
  const apiKey = request.headers.get("X-API-Key")
  const expectedKey = process.env.REVALIDATE_API_KEY

  if (!expectedKey) {
    console.error("REVALIDATE_API_KEY environment variable is not set")
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // リクエストボディをパース
  let body: RevalidateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  // タグを取得（単一または複数）
  const tags: string[] = []
  if (body.tag) {
    tags.push(body.tag)
  }
  if (body.tags && Array.isArray(body.tags)) {
    tags.push(...body.tags)
  }

  if (tags.length === 0) {
    return NextResponse.json(
      { error: "No tags provided. Use 'tag' or 'tags' field." },
      { status: 400 }
    )
  }

  // 各タグを再検証（Next.js 16では第2引数にcacheLifeプロファイルが必要）
  const revalidated: string[] = []
  for (const tag of tags) {
    if (typeof tag === "string" && tag.length > 0) {
      revalidateTag(tag, "max")
      revalidated.push(tag)
    }
  }

  console.log(`[Revalidate] Tags invalidated: ${revalidated.join(", ")}`)

  return NextResponse.json({
    success: true,
    revalidated,
    timestamp: new Date().toISOString(),
  })
}

// GETメソッドは許可しない
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  )
}
