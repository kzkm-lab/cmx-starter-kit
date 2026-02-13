import { NextRequest } from "next/server"
import { runAgent } from "@/lib/setup/agent"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/setup/chat
 * メッセージを受信 → Claude Code CLI で処理 → SSE でストリーミングレスポンス
 *
 * セッション管理:
 * - 初回: sessionId なしで呼び出し → Claude Code が生成した実際の sessionId を返す
 * - 2回目以降: クライアントから受け取った sessionId を --resume に渡す
 */
export async function POST(request: NextRequest) {
  try {
    const { message, sessionId: clientSessionId } = await request.json()

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "メッセージが必要です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Claude Code の実際の session_id を使う
    // 初回は null → Claude Code が生成、2回目以降は --resume で渡す
    const sessionId = clientSessionId || null

    // SSE ストリームの作成
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Agent で メッセージを処理
          // session タイプのメッセージで Claude Code の実際の sessionId が返る
          for await (const agentMessage of runAgent({
            prompt: message,
            sessionId,
          })) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(agentMessage)}\n\n`)
            )
          }

          // 完了通知
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`))
          controller.close()
        } catch (error) {
          console.error("Agent error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "エラーが発生しました",
              })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Request error:", error)
    return new Response(JSON.stringify({ error: "リクエストの処理に失敗しました" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
