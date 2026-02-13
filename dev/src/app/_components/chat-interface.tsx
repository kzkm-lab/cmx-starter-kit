"use client"

import { useState, useEffect } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { AuthStatus } from "./auth-status"
import { SettingsDialog } from "./settings-dialog"
import { AlertCircle, Settings, SendHorizontal, Terminal, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

type EnvVars = {
  CMX_API_KEY?: string
  CMX_API_URL?: string
  NEXT_PUBLIC_SITE_URL?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 環境変数の状態
  const [envConfigured, setEnvConfigured] = useState<boolean | null>(null)
  const [envValues, setEnvValues] = useState<EnvVars>({})

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

  // 環境変数の状態を確認
  useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch("/api/setup/env")
        const data = await response.json()

        // CMX_API_KEY が設定されているかチェック
        const isConfigured = !!(data.env?.CMX_API_KEY && data.env.CMX_API_KEY !== "your_api_key_here")
        setEnvConfigured(isConfigured)
        setEnvValues(data.env || {})
      } catch (error) {
        console.error("Failed to check env status:", error)
        setEnvConfigured(false)
      }
    }
    checkEnv()
  }, [settingsOpen])

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter または Ctrl+Enter で送信
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* ステータスバー */}
      <div className="border-b border-slate-200 px-4 py-3 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
           <Terminal className="w-4 h-4 text-slate-400" />
           <span className="text-sm font-semibold tracking-tight">Console</span>
        </div>
        <div className="flex items-center gap-3">
          <AuthStatus />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-500"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* メッセージリスト (Stream Log Style) */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 font-mono text-sm leading-relaxed">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
             <div className="p-4 bg-slate-100 rounded-lg max-w-md w-full">
                <p className="font-semibold text-slate-900 mb-2">Authentication Required</p>
                <p className="text-sm mb-4">Please login to Claude Code to continue.</p>
                <code className="block bg-slate-900 text-slate-50 p-3 rounded text-xs">claude-code login</code>
             </div>
          </div>
        ) : envConfigured === false ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto my-8">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                   <h3 className="font-semibold text-amber-900 mb-1">Missing Configuration</h3>
                   <p className="text-amber-800 text-sm mb-3">Environment variables are not configured.</p>
                   <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100" onClick={() => setSettingsOpen(true)}>
                     Configure
                   </Button>
                </div>
              </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Terminal className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Ready to assist. Type a command or request.</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={`group flex gap-4 ${message.role === 'user' ? 'pt-4 border-t border-slate-100 mt-4 first:mt-0 first:border-0 first:pt-0' : ''}`}>
                 <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold mt-0.5
                    ${message.role === 'user' ? 'bg-slate-900 text-white' : 
                      message.role === 'system' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {message.role === 'user' ? 'U' : message.role === 'system' ? '!' : 'AI'}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                    {message.content}
                    </div>
                 </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
                 <div className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 flex items-center justify-center mt-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                 </div>
                 <div className="flex-1">
                    <span className="text-slate-400 text-sm animate-pulse">Processing...</span>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!isAuthenticated || !envConfigured ? "System unavailable" : "Type instructions..."}
            className="w-full min-h-[56px] pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all resize-none text-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isAuthenticated || !envConfigured}
            rows={1}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || !isAuthenticated || !envConfigured}
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
        <div className="max-w-3xl mx-auto mt-2 flex justify-between px-1">
           <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Console v1.0.0</span>
           <span className="text-[10px] text-slate-400">Cmd + Enter to send</span>
        </div>
      </div>

      {/* 設定ダイアログ */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}
