"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AuthStatus } from "./auth-status"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // 認証状態を確認
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status")
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } catch (error) {
        console.error("Failed to check auth status:", error)
      }
    }
    checkAuth()

    // 定期的に認証状態を確認（30秒ごと）
    const interval = setInterval(checkAuth, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isAuthenticated) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/setup/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("チャットAPIの呼び出しに失敗しました")
      }

      // SSE ストリーム処理
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessageContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === "session") {
                  setSessionId(data.sessionId)
                } else if (data.type === "text") {
                  assistantMessageContent += data.content
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    const lastMessage = newMessages[newMessages.length - 1]
                    if (lastMessage?.role === "assistant") {
                      lastMessage.content = assistantMessageContent
                    } else {
                      newMessages.push({
                        role: "assistant",
                        content: assistantMessageContent,
                      })
                    }
                    return newMessages
                  })
                } else if (data.type === "error") {
                  throw new Error(data.message || "エラーが発生しました")
                } else if (data.type === "done") {
                  break
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        role: "system",
        content: "エラーが発生しました。もう一度お試しください。",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">CMX Starter Kit セットアップ</h1>
            <p className="text-sm text-muted-foreground">
              AI アシスタントがサイトのセットアップをお手伝いします
            </p>
          </div>
          <AuthStatus />
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isAuthenticated ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium">
              Claude Code で認証してください
            </p>
            <p className="mt-2 text-sm">
              セットアップを開始するには、まず右上の「Claude Code で認証」ボタンから認証を完了してください。
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium">
              セットアップを開始するために、メッセージを送信してください
            </p>
            <p className="mt-2 text-sm">
              例: 「サイトをセットアップしてください」
            </p>
            <div className="mt-6 text-left max-w-md mx-auto space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">AI アシスタントができること：</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>サイト設定ファイルの編集</li>
                <li>ページテンプレートの作成</li>
                <li>コンポーネントのカスタマイズ</li>
                <li>スタイルの調整</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%]"
                  : message.role === "system"
                    ? "bg-red-100 mx-auto max-w-[80%] text-center"
                    : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
              <p className="text-gray-600">AI が応答を生成中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isAuthenticated
              ? "メッセージを入力..."
              : "認証が必要です"
          }
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isLoading || !isAuthenticated}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || !isAuthenticated}
        >
          送信
        </Button>
      </form>
    </div>
  )
}
