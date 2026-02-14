"use client"

import { useState, useEffect } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "./settings-dialog"
import { CommandMenu, type CommandMetadata } from "./command-menu"
import { AlertCircle, SendHorizontal, Terminal, Loader2 } from "lucide-react"
import { TodoPanel } from "./todo-panel"
import { DeployPanel } from "./deploy-panel"
import type { TodoItem } from "@/lib/setup/claude-code-cli"

interface Message {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  toolName?: string
}

type ChatTab = {
  id: string
  title: string
  messages: Message[]
  sessionId: string | null
  todos: TodoItem[]
}

interface ChatInterfaceProps {
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
}

export function ChatInterface({ settingsOpen, onSettingsOpenChange }: ChatInterfaceProps) {
  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: "1",
      title: "Chat 1",
      messages: [],
      sessionId: null,
      todos: [],
    },
  ])
  const [activeTabId, setActiveTabId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 環境変数の状態
  const [envConfigured, setEnvConfigured] = useState<boolean | null>(null)

  // セッション復元済みフラグ
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  // アクティブなタブのデータを取得
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0]
  const messages = activeTab.messages

  // 初回ロード時にセッション情報を復元
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch("/api/setup/sessions")
        const data = await response.json()

        if (data.tabs && data.tabs.length > 0) {
          setTabs(data.tabs)
          setActiveTabId(data.tabs[0].id)
        }
      } catch (error) {
        console.error("Failed to load sessions:", error)
      } finally {
        setSessionsLoaded(true)
      }
    }

    loadSessions()
  }, [])

  // タブ更新時に自動保存
  useEffect(() => {
    if (!sessionsLoaded) return // 初回ロード完了前は保存しない

    const saveSessions = async () => {
      try {
        await fetch("/api/setup/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tabs }),
        })
      } catch (error) {
        console.error("Failed to save sessions:", error)
      }
    }

    // デバウンス処理（1秒後に保存）
    const timeoutId = setTimeout(saveSessions, 1000)
    return () => clearTimeout(timeoutId)
  }, [tabs, sessionsLoaded])

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
      } catch (error) {
        console.error("Failed to check env status:", error)
        setEnvConfigured(false)
      }
    }
    checkEnv()
  }, [settingsOpen])

  // タブごとのメッセージ更新ヘルパー
  const updateTabMessages = (tabId: string, updater: (messages: Message[]) => Message[]) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, messages: updater(tab.messages) } : tab
      )
    )
  }

  // タブのセッションID更新
  const updateTabSessionId = (tabId: string, sessionId: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, sessionId } : tab
      )
    )
  }

  // タブの todos 更新
  const updateTabTodos = (tabId: string, todos: TodoItem[]) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, todos } : tab
      )
    )
  }

  // 新しいタブを追加
  const addNewTab = () => {
    const newTabId = Date.now().toString()
    const newTab: ChatTab = {
      id: newTabId,
      title: `Chat ${tabs.length + 1}`,
      messages: [],
      sessionId: null,
      todos: [],
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTabId)
  }

  // タブを閉じる
  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return // 最後のタブは閉じない

    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== tabId)
      // 閉じたタブがアクティブだった場合、隣のタブをアクティブにする
      if (activeTabId === tabId) {
        const index = prev.findIndex((tab) => tab.id === tabId)
        const nextTab = filtered[Math.max(0, index - 1)]
        setActiveTabId(nextTab.id)
      }
      return filtered
    })
  }

  // コマンド選択時の処理
  const handleCommandSelect = async (command: CommandMetadata) => {
    try {
      // コマンドの内容を取得
      const response = await fetch("/api/setup/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandId: command.id }),
      })

      const data = await response.json()

      // コマンドの内容をチャットに表示
      const commandMessage: Message = {
        role: "system",
        content: `Command: ${command.name}\n\n${data.content || ""}`,
      }
      updateTabMessages(activeTabId, (prev) => [...prev, commandMessage])
    } catch (error) {
      console.error("Failed to execute command:", error)
    }
  }

  // メッセージ送信の共通ロジック（DeployPanel からも呼ばれる）
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !isAuthenticated) return

    const userMessage: Message = { role: "user", content: message }
    updateTabMessages(activeTabId, (prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/setup/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId: activeTab.sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("チャットAPIの呼び出しに失敗しました")
      }

      // SSE ストリーム処理
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          sseBuffer += decoder.decode(value, { stream: true })
          const lines = sseBuffer.split("\n")
          sseBuffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue

            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === "session" && data.sessionId) {
                // Claude Code が生成した実際の session_id を保存
                updateTabSessionId(activeTabId, data.sessionId)
              } else if (data.type === "text") {
                // assistant メッセージは全テキストが含まれる（差分ではない）ので置換
                updateTabMessages(activeTabId, (prev) => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage?.role === "assistant") {
                    lastMessage.content = data.content
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: data.content,
                    })
                  }
                  return newMessages
                })
              } else if (data.type === "tool_use") {
                // ツール呼び出しの表示
                updateTabMessages(activeTabId, (prev) => [
                  ...prev,
                  {
                    role: "tool" as const,
                    content: `${data.toolName}`,
                    toolName: data.toolName,
                  },
                ])
              } else if (data.type === "tool_result") {
                // ツール結果の表示（最後の tool メッセージを更新）
                updateTabMessages(activeTabId, (prev) => {
                  const newMessages = [...prev]
                  const lastTool = newMessages.findLast((m) => m.role === "tool")
                  if (lastTool) {
                    lastTool.content = `${lastTool.toolName} (completed)`
                  }
                  return newMessages
                })
              } else if (data.type === "todo_update" && data.todos) {
                updateTabTodos(activeTabId, data.todos)
              } else if (data.type === "error") {
                updateTabMessages(activeTabId, (prev) => [
                  ...prev,
                  {
                    role: "system" as const,
                    content: data.error || "エラーが発生しました",
                  },
                ])
              } else if (data.type === "done") {
                break
              }
            } catch {
              // JSON パース失敗は無視
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
      updateTabMessages(activeTabId, (prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const message = input
    setInput("")
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter または Ctrl+Enter で送信
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* タブバー */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTabId === tab.id
                ? "bg-white text-slate-900 border-b-2 border-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="whitespace-nowrap">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded p-0.5 transition-opacity"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addNewTab}
          className="flex-shrink-0 px-2 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="新しいチャットを開く"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
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
                   <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100" onClick={() => onSettingsOpenChange(true)}>
                     Configure
                   </Button>
                </div>
              </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6">
            <DeployPanel onSendMessage={sendMessage} isLoading={isLoading} />
            <div className="flex flex-col items-center">
              <Terminal className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Ready to assist. Type a command or request.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* デプロイパネル */}
            <DeployPanel onSendMessage={sendMessage} isLoading={isLoading} />
            {messages.map((message, index) => (
              <div key={index} className={`group flex gap-4 ${message.role === 'user' ? 'pt-4 border-t border-slate-100 mt-4 first:mt-0 first:border-0 first:pt-0' : ''}`}>
                 <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold mt-0.5
                    ${message.role === 'user' ? 'bg-slate-900 text-white' :
                      message.role === 'system' ? 'bg-red-100 text-red-600' :
                      message.role === 'tool' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {message.role === 'user' ? 'U' : message.role === 'system' ? '!' : message.role === 'tool' ? 'T' : 'AI'}
                 </div>
                 <div className="flex-1 min-w-0">
                    {message.role === 'tool' ? (
                      <div className="text-xs text-slate-500 font-mono py-1">
                        {message.content}
                      </div>
                    ) : (
                      <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                        {message.content}
                      </div>
                    )}
                 </div>
              </div>
            ))}
            
            {/* Todo Panel */}
            {activeTab.todos?.length > 0 && (
              <div className="mt-4">
                <TodoPanel todos={activeTab.todos} />
              </div>
            )}

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
        <div className="max-w-3xl mx-auto">
          <div className="mb-2">
            <CommandMenu onCommandSelect={handleCommandSelect} />
          </div>
          <form onSubmit={handleSubmit} className="relative">
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
          <div className="mt-2 flex justify-between px-1">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Console v1.0.0</span>
            <span className="text-[10px] text-slate-400">Cmd + Enter to send</span>
          </div>
        </div>
      </div>

      {/* 設定ダイアログ */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={onSettingsOpenChange}
      />
    </div>
  )
}
