import { NextRequest, NextResponse } from "next/server"
import { checkSetupStatus, getSiteDirPath } from "@/lib/setup/setup-state"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/setup/status
 * site/ ディレクトリを検査してセットアップ状態を JSON で返す
 */
export async function GET(request: NextRequest) {
  try {
    const siteDir = getSiteDirPath()
    const status = checkSetupStatus(siteDir)

    return NextResponse.json({
      success: true,
      ...status,
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "ステータス確認に失敗しました",
      },
      { status: 500 }
    )
  }
}
