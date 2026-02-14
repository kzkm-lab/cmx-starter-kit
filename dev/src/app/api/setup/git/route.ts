import { NextRequest } from "next/server"
import { getGitStatus, getGitDiffSummary } from "@/lib/setup/git-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/setup/git
 * サイトの git ステータスを返す（ブランチ、変更ファイル、環境情報）
 */
export async function GET() {
  try {
    const status = getGitStatus()
    return Response.json(status)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Git情報の取得に失敗" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/setup/git
 * アクション実行（diff取得など）
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "diff": {
        const diff = getGitDiffSummary()
        return Response.json({ diff })
      }
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "アクション実行に失敗" },
      { status: 500 }
    )
  }
}
