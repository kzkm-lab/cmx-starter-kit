import { NextRequest, NextResponse } from "next/server"
import { generateVerifier, generateChallenge, oauthHandoffStore } from "@/lib/auth/oauth-handoff"
import { claudeCodeClient } from "@/lib/auth/claude-code-client"

/**
 * OAuth Handoff 開始エンドポイント
 *
 * POST /api/auth/init
 * Body: { provider: string, returnTo: string }
 * Response: { handoffId: string, authorizeUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, returnTo } = body

    if (!provider || !returnTo) {
      return NextResponse.json(
        { error: "provider and returnTo are required" },
        { status: 400 }
      )
    }

    // PKCE verifier と challenge を生成
    const verifier = generateVerifier()
    const challenge = generateChallenge(verifier)

    // Claude Code API に OAuth Handoff を開始
    const response = await claudeCodeClient.handoffInit({
      provider,
      returnTo,
      appChallenge: challenge,
    })

    // verifier をセッションストアに保存
    oauthHandoffStore.store(response.handoffId, verifier, provider)

    return NextResponse.json({
      handoffId: response.handoffId,
      authorizeUrl: response.authorizeUrl,
    })
  } catch (error) {
    console.error("OAuth Handoff init failed:", error)
    return NextResponse.json(
      { error: "OAuth Handoff initialization failed" },
      { status: 500 }
    )
  }
}
