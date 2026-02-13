import { NextRequest } from "next/server"
import { runAgent } from "@/lib/setup/agent"
import { createSession, hasSession, touchSession } from "@/lib/setup/session-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/setup/chat
 * メッセージを受信 → Agent SDK で処理 → SSE でストリーミングレスポンス
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

    // セッションIDの確認または作成
    let sessionId = clientSessionId
    if (!sessionId || !hasSession(sessionId)) {
      sessionId = createSession()
    } else {
      touchSession(sessionId)
    }

    // SSE ストリームの作成
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // セッションIDを最初に送信
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "session", sessionId })}\n\n`)
          )

          // Agent SDK でメッセージを処理
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
                content: error instanceof Error ? error.message : "エラーが発生しました",
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
