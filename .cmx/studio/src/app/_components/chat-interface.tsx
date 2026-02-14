"use client"

import { useState, useEffect } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "./settings-dialog"
import { CommandMenu, type CommandMetadata } from "./command-menu"
import { AlertCircle, SendHorizontal, Terminal, Loader2, GitBranch, Plus, MessageSquare } from "lucide-react"
import { TodoPanel } from "./todo-panel"
import { DeployPanel } from "./deploy-panel"
import type { TodoItem } from "@/lib/setup/claude-code-cli"

// ============================================================
// 型定義（クライアント側）
// ============================================================

interface Message {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  toolName?: string
}

type TaskStatus = "idle" | "working" | "paused" | "done"

/** チャット（会話単位） */
interface Chat {
  id: string
  title: string
  messages: Message[]
  sessionId: string | null
  todos: TodoItem[]
}

/** タスク（作業単位 = ブランチ） */
interface Task {
  id: string
  title: string
  branchName: string | null
  status: TaskStatus
  chats: Chat[]
  activeChatId: string
}

// ============================================================
// ヘルパー
// ============================================================

function createChat(index: number): Chat {
  const id = Date.now().toString()
  return {
    id,
    title: `Chat ${index}`,
    messages: [],
    sessionId: null,
    todos: [],
  }
}

function createTask(index: number): Task {
  const id = Date.now().toString()
  const chat = createChat(1)
  return {
    id,
    title: `Task ${index}`,
    branchName: `cmx/task-${id}`,
    status: "idle",
    chats: [chat],
    activeChatId: chat.id,
  }
}

// ============================================================
// コンポーネント
// ============================================================

interface ChatInterfaceProps {
  settingsOpen: boolean
  onSettingsOpenChange: (open: boolean) => void
}

export function ChatInterface({ settingsOpen, onSettingsOpenChange }: ChatInterfaceProps) {
  // タスク・チャット状態
  const [tasks, setTasks] = useState<Task[]>(() => {
    const task = createTask(1)
    return [task]
  })
  const [activeTaskId, setActiveTaskId] = useState(() => tasks[0].id)

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 環境変数の状態
  const [envConfigured, setEnvConfigured] = useState<boolean | null>(null)

  // 開発ブランチの準備状態
  const [branchReady, setBranchReady] = useState<boolean | null>(null)
  const [isCreatingBranch, setIsCreatingBranch] = useState(false)
  const [targetBranchName, setTargetBranchName] = useState("develop")

  // セッション復元済みフラグ
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  // アクティブなタスク・チャットを取得（データ不整合時のフォールバック付き）
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? tasks[0]
  const activeChat = activeTask?.chats?.find((c) => c.id === activeTask.activeChatId) ?? activeTask?.chats?.[0]
  const messages = activeChat?.messages ?? []

  // ============================================================
  // セッション管理
  // ============================================================

  // 初回ロード時にセッション情報を復元
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch("/api/setup/sessions")
        const data = await response.json()

        if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          // chats 配列を持つ有効なタスクのみ復元
          const validTasks = (data.tasks as Task[]).filter(
            (t) => t.id && Array.isArray(t.chats) && t.chats.length > 0
          )
          if (validTasks.length > 0) {
            setTasks(validTasks)
            setActiveTaskId(validTasks[0].id)
          }
        }
      } catch (error) {
        console.error("Failed to load sessions:", error)
      } finally {
        setSessionsLoaded(true)
      }
    }

    loadSessions()
  }, [])

  // タスク更新時に自動保存
  useEffect(() => {
    if (!sessionsLoaded) return

    const saveSessions = async () => {
      try {
        await fetch("/api/setup/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks }),
        })
      } catch (error) {
        console.error("Failed to save sessions:", error)
      }
    }

    const timeoutId = setTimeout(saveSessions, 1000)
    return () => clearTimeout(timeoutId)
  }, [tasks, sessionsLoaded])

  // ============================================================
  // 環境チェック
  // ============================================================

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

    const interval = setInterval(checkAuth, 30000)
    return () => clearInterval(interval)
  }, [])

  // 環境変数の状態を確認
  useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch("/api/setup/env")
        const data = await response.json()

        const isConfigured = !!(data.env?.CMX_API_KEY && data.env.CMX_API_KEY !== "your_api_key_here")
        setEnvConfigured(isConfigured)
      } catch (error) {
        console.error("Failed to check env status:", error)
        setEnvConfigured(false)
      }
    }
    checkEnv()
  }, [settingsOpen])

  // 開発ブランチの存在チェック
  useEffect(() => {
    if (!envConfigured) return

    const checkBranch = async () => {
      try {
        const response = await fetch("/api/setup/git")
        const data = await response.json()
        if (data.error) {
          setBranchReady(false)
          return
        }
        setTargetBranchName(data.targetBranch || "develop")
        const targetEnv = data.environments?.find(
          (e: { branch: string; exists: boolean }) => e.branch === data.targetBranch
        )
        setBranchReady(targetEnv?.exists ?? false)
      } catch {
        setBranchReady(false)
      }
    }
    checkBranch()
  }, [envConfigured, settingsOpen])

  // 開発ブランチを作成
  const handleCreateBranch = async () => {
    setIsCreatingBranch(true)
    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-branch", branchName: targetBranchName }),
      })
      const data = await response.json()
      if (data.success) {
        setBranchReady(true)
      }
    } catch (error) {
      console.error("Failed to create branch:", error)
    } finally {
      setIsCreatingBranch(false)
    }
  }

  // ============================================================
  // タスク更新ヘルパー
  // ============================================================

  /** タスクを更新 */
  const updateTask = (taskId: string, updater: (task: Task) => Task) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updater(t) : t)))
  }

  /** アクティブタスク内のチャットを更新 */
  const updateChat = (chatId: string, updater: (chat: Chat) => Chat) => {
    updateTask(activeTaskId, (task) => ({
      ...task,
      chats: task.chats.map((c) => (c.id === chatId ? updater(c) : c)),
    }))
  }

  /** アクティブチャットのメッセージを更新 */
  const updateMessages = (updater: (messages: Message[]) => Message[]) => {
    if (!activeChat) return
    updateChat(activeChat.id, (chat) => ({ ...chat, messages: updater(chat.messages) }))
  }

  /** アクティブチャットのセッションIDを更新 */
  const updateSessionId = (sessionId: string) => {
    if (!activeChat) return
    updateChat(activeChat.id, (chat) => ({ ...chat, sessionId }))
  }

  /** アクティブチャットの todos を更新 */
  const updateTodos = (todos: TodoItem[]) => {
    if (!activeChat) return
    updateChat(activeChat.id, (chat) => ({ ...chat, todos }))
  }

  // ============================================================
  // タスク操作
  // ============================================================

  /** タスク切り替え（ブランチ切り替え） */
  const handleTaskSwitch = async (newTaskId: string) => {
    if (newTaskId === activeTaskId) return
    if (isLoading) return

    const targetTask = tasks.find((t) => t.id === newTaskId)
    if (!targetTask) return

    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "switch-task",
          fromTaskId: activeTaskId,
          toTaskId: newTaskId,
          toBranch: targetTask.branchName,
        }),
      })
      const data = await response.json()
      if (data.success) {
        // 切替元を paused に
        if (activeTask.status === "working") {
          updateTask(activeTaskId, (t) => ({ ...t, status: "paused" as const }))
        }
        setActiveTaskId(newTaskId)
      } else {
        console.error("Failed to switch task:", data.error)
      }
    } catch (error) {
      console.error("Failed to switch task:", error)
    }
  }

  /** 新しいタスクを追加 */
  const addNewTask = () => {
    const newTask = createTask(tasks.length + 1)
    setTasks((prev) => [...prev, newTask])
    handleTaskSwitch(newTask.id)
  }

  /** タスク反映（直接マージモード） */
  const handleApplyTask = async () => {
    if (!activeTask.branchName) return

    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply-task",
          taskId: activeTaskId,
          branchName: activeTask.branchName,
          summary: activeTask.title,
        }),
      })
      const data = await response.json()
      if (data.success) {
        updateTask(activeTaskId, (t) => ({ ...t, status: "done" as const }))
      } else {
        console.error("Failed to apply task:", data.error)
      }
    } catch (error) {
      console.error("Failed to apply task:", error)
    }
  }

  /** タスクブランチをプッシュ（PR モード） */
  const handlePushTask = async () => {
    if (!activeTask.branchName) return

    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push-task",
          taskId: activeTaskId,
          branchName: activeTask.branchName,
        }),
      })
      const data = await response.json()
      if (data.success) {
        updateTask(activeTaskId, (t) => ({ ...t, status: "done" as const }))
        sendMessage(
          `ブランチ ${activeTask.branchName} をリモートにプッシュしました。GitHub で develop へのプルリクエストを作成してください。`
        )
      } else {
        console.error("Failed to push task:", data.error)
      }
    } catch (error) {
      console.error("Failed to push task:", error)
    }
  }

  // ============================================================
  // チャット操作（タスク内、ブランチ切り替えなし）
  // ============================================================

  /** チャットタブ切り替え（ブランチ切り替えなし） */
  const handleChatSwitch = (chatId: string) => {
    if (!activeTask || chatId === activeTask.activeChatId) return
    updateTask(activeTaskId, (task) => ({ ...task, activeChatId: chatId }))
  }

  /** 新しいチャットを追加（タスク内） */
  const addNewChat = () => {
    if (!activeTask) return
    const newChat = createChat(activeTask.chats.length + 1)
    updateTask(activeTaskId, (task) => ({
      ...task,
      chats: [...task.chats, newChat],
      activeChatId: newChat.id,
    }))
  }

  /** チャットタブを閉じる */
  const closeChat = (chatId: string) => {
    if (!activeTask || activeTask.chats.length === 1) return

    updateTask(activeTaskId, (task) => {
      const filtered = task.chats.filter((c) => c.id !== chatId)
      const newActiveChatId =
        task.activeChatId === chatId
          ? filtered[Math.max(0, task.chats.findIndex((c) => c.id === chatId) - 1)].id
          : task.activeChatId
      return { ...task, chats: filtered, activeChatId: newActiveChatId }
    })
  }

  // ============================================================
  // メッセージ送信
  // ============================================================

  const handleCommandSelect = async (command: CommandMetadata) => {
    try {
      const response = await fetch("/api/setup/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandId: command.id }),
      })

      const data = await response.json()

      const commandMessage: Message = {
        role: "system",
        content: `Command: ${command.name}\n\n${data.content || ""}`,
      }
      updateMessages((prev) => [...prev, commandMessage])
    } catch (error) {
      console.error("Failed to execute command:", error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !isAuthenticated || !activeTask || !activeChat) return

    const userMessage: Message = { role: "user", content: message }
    updateMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // タスクステータスを working に
    if (activeTask.status === "idle" || activeTask.status === "paused") {
      updateTask(activeTaskId, (t) => ({ ...t, status: "working" as const }))
    }

    try {
      const response = await fetch("/api/setup/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId: activeChat?.sessionId ?? null,
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
                updateSessionId(data.sessionId)
              } else if (data.type === "text") {
                updateMessages((prev) => {
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
                updateMessages((prev) => [
                  ...prev,
                  {
                    role: "tool" as const,
                    content: `${data.toolName}`,
                    toolName: data.toolName,
                  },
                ])
              } else if (data.type === "tool_result") {
                updateMessages((prev) => {
                  const newMessages = [...prev]
                  const lastTool = newMessages.findLast((m) => m.role === "tool")
                  if (lastTool) {
                    lastTool.content = `${lastTool.toolName} (completed)`
                  }
                  return newMessages
                })
              } else if (data.type === "todo_update" && data.todos) {
                updateTodos(data.todos)
              } else if (data.type === "error") {
                updateMessages((prev) => [
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
      updateMessages((prev) => [...prev, errorMessage])
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
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // ============================================================
  // UI ヘルパー
  // ============================================================

  const statusDotClass = (status: TaskStatus) => {
    switch (status) {
      case "working":
        return "bg-blue-500 animate-pulse"
      case "paused":
        return "bg-amber-400"
      case "done":
        return "bg-green-500"
      default:
        return "bg-slate-300"
    }
  }

  // ============================================================
  // レンダリング
  // ============================================================

  return (
    <div className="flex flex-col h-full">

      {/* タスクバー（タスク切り替え + ステータス） */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {tasks.map((task) => (
          <button
            key={task.id}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTaskId === task.id
                ? "bg-white text-slate-900 border-b-2 border-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => handleTaskSwitch(task.id)}
            disabled={isLoading && activeTaskId !== task.id}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotClass(task.status)}`} />
            <span>{task.title}</span>
          </button>
        ))}
        <button
          onClick={addNewTask}
          className="flex-shrink-0 px-2 py-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          title="新しいタスクを開く"
          disabled={isLoading}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* タスクヘッダー: ブランチ状態 + アクションボタン（環境準備完了時のみ） */}
      {isAuthenticated && envConfigured && branchReady && activeTask && (
        <div className="border-b border-slate-100">
          <DeployPanel
            onSendMessage={sendMessage}
            isLoading={isLoading}
            currentTaskBranch={activeTask.branchName}
            taskStatus={activeTask.status}
            onApplyTask={handleApplyTask}
            onPushTask={handlePushTask}
          />
        </div>
      )}

      {/* チャットタブ（タスク内の会話切り替え） */}
      {isAuthenticated && envConfigured && branchReady && activeTask && (
        <div className="border-b border-slate-100 bg-white px-2 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          <MessageSquare className="w-3 h-3 text-slate-300 mx-1 flex-shrink-0" />
          {activeTask.chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                activeTask.activeChatId === chat.id
                  ? "text-slate-900 bg-slate-50 rounded-t"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => handleChatSwitch(chat.id)}
            >
              <span className="whitespace-nowrap">{chat.title}</span>
              {activeTask.chats.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded p-0.5 transition-opacity"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewChat}
            className="flex-shrink-0 px-1.5 py-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="新しいチャットを追加"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* メッセージリスト（チャット専用） */}
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
        ) : branchReady === false ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <div className="p-4 bg-slate-100 rounded-lg max-w-md w-full space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-slate-600" />
                <p className="font-semibold text-slate-900">開発ブランチのセットアップ</p>
              </div>
              <p className="text-sm text-slate-600">
                変更管理を開始するには、開発ブランチ（<code className="bg-slate-200 px-1 rounded text-xs">{targetBranchName}</code>）を作成してください。
                すべての作業はこのブランチ上で行います。
              </p>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleCreateBranch}
                disabled={isCreatingBranch}
              >
                {isCreatingBranch ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitBranch className="w-3.5 h-3.5" />
                )}
                {isCreatingBranch ? "作成中..." : "開発ブランチを作成"}
              </Button>
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
            {activeChat?.todos?.length > 0 && (
              <div className="mt-4">
                <TodoPanel todos={activeChat.todos} />
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
              placeholder={!isAuthenticated || !envConfigured || !branchReady ? "System unavailable" : "Type instructions..."}
              className="w-full min-h-[56px] pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all resize-none text-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isAuthenticated || !envConfigured || !branchReady}
              rows={1}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || !isAuthenticated || !envConfigured || !branchReady}
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
