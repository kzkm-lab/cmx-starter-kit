import { NextResponse } from "next/server"
import { loadCredentials, isTokenExpired } from "@/lib/auth/token-store"
import { claudeCodeClient } from "@/lib/auth/claude-code-client"

/**
 * 認証状態確認エンドポイント
 *
 * GET /api/auth/status
 * Response: { authenticated: boolean, user?: { name: string, email: string } }
 */
export async function GET() {
  try {
    const credentials = await loadCredentials()

    if (!credentials) {
      return NextResponse.json({ authenticated: false })
    }

    // トークンの有効期限チェック
    if (isTokenExpired(credentials)) {
      return NextResponse.json({ authenticated: false })
    }

    // ユーザー情報を取得
    try {
      const user = await claudeCodeClient.getUserProfile()
      return NextResponse.json({
        authenticated: true,
        user: {
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      // トークンが無効な場合
      console.error("Failed to get user profile:", error)
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error("Auth status check failed:", error)
    return NextResponse.json({ authenticated: false })
  }
}
