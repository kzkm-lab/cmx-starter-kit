import { NextResponse } from "next/server"
import { existsSync } from "fs"
import { homedir } from "os"
import { join } from "path"

/**
 * 認証状態確認エンドポイント（簡略版）
 *
 * GET /api/auth/status
 * Response: { authenticated: boolean }
 */
export async function GET() {
  try {
    // ~/.claude.json が存在するかチェック
    const claudeJsonPath = join(homedir(), ".claude.json")
    const isAuthenticated = existsSync(claudeJsonPath)

    return NextResponse.json({
      authenticated: isAuthenticated,
    })
  } catch (error) {
    console.error("Auth status check failed:", error)
    return NextResponse.json({ authenticated: false })
  }
}
