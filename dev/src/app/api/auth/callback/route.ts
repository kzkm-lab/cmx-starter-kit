import { NextRequest, NextResponse } from "next/server"
import { oauthHandoffStore } from "@/lib/auth/oauth-handoff"
import { claudeCodeClient } from "@/lib/auth/claude-code-client"
import { saveCredentials } from "@/lib/auth/token-store"

/**
 * OAuth Handoff コールバックエンドポイント
 *
 * GET /api/auth/callback?handoff_id=xxx&app_code=xxx&error=xxx
 * Response: HTML（ウィンドウを閉じる）
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const handoffId = searchParams.get("handoff_id")
  const appCode = searchParams.get("app_code")
  const error = searchParams.get("error")

  // エラーがある場合
  if (error) {
    return new NextResponse(
      createHtmlResponse({
        title: "認証エラー",
        message: `OAuth 認証に失敗しました: ${error}`,
        autoClose: true,
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }

  // handoff_id または app_code がない場合
  if (!handoffId || !appCode) {
    return new NextResponse(
      createHtmlResponse({
        title: "認証エラー",
        message: "handoff_id または app_code がありません",
        autoClose: true,
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }

  try {
    // セッションストアから verifier を取得
    const session = oauthHandoffStore.take(handoffId)

    if (!session) {
      return new NextResponse(
        createHtmlResponse({
          title: "認証エラー",
          message: "OAuth Handoff セッションが見つかりません",
          autoClose: true,
        }),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      )
    }

    // Claude Code API でトークンを取得
    const redeemResponse = await claudeCodeClient.handoffRedeem({
      handoffId,
      appCode,
      appVerifier: session.verifier,
    })

    // トークンを保存
    await saveCredentials({
      accessToken: redeemResponse.accessToken,
      refreshToken: redeemResponse.refreshToken,
      expiresAt: redeemResponse.expiresIn
        ? new Date(Date.now() + redeemResponse.expiresIn * 1000).toISOString()
        : undefined,
    })

    // 成功レスポンス
    return new NextResponse(
      createHtmlResponse({
        title: "認証成功",
        message: `${session.provider} で認証が完了しました。このウィンドウを閉じてください。`,
        autoClose: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  } catch (error) {
    console.error("OAuth Handoff callback failed:", error)
    return new NextResponse(
      createHtmlResponse({
        title: "認証エラー",
        message: "トークンの取得に失敗しました",
        autoClose: true,
      }),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }
}

/**
 * HTML レスポンスを生成
 */
function createHtmlResponse(options: {
  title: string
  message: string
  autoClose?: boolean
}): string {
  const { title, message, autoClose } = options

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    ${
      autoClose
        ? `
    <script>
      window.addEventListener('load', () => {
        try { window.close(); } catch (err) {}
        setTimeout(() => { window.close(); }, 150);
      });
    </script>
    `
        : ""
    }
    <style>
      body {
        font-family: sans-serif;
        margin: 3rem;
        color: #1f2933;
      }
      h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      p {
        font-size: 1rem;
        color: #52606d;
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${message}</p>
    ${autoClose ? "<p>このウィンドウは自動的に閉じます。</p>" : ""}
  </body>
</html>
  `.trim()
}
