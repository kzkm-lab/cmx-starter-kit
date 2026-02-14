"use client"

import { useState, useEffect, useRef } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "./settings-dialog"
import { CommandMenu, type CommandMetadata } from "./command-menu"
import { AlertCircle, SendHorizontal, Terminal, Loader2, GitBranch, Plus, MessageSquareText, Archive, RotateCcw, FolderGit2 } from "lucide-react"
import { TodoPanel } from "./todo-panel"
import { DeployPanel } from "./deploy-panel"
import type { TodoItem } from "@/lib/setup/claude-code-cli"
import { MessageEntryComponent } from "./message-entry"
import { LumaSpin } from "@/components/ui/luma-spin"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"

// ============================================================
// 型定義（クライアント側）
// ============================================================

type ToolStatus = "pending" | "success" | "error" | "completed"

interface Message {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  toolName?: string
  toolStatus?: ToolStatus
  thinking?: boolean
}

type TaskStatus = "idle" | "working" | "paused" | "done"
const EMPTY_MESSAGES: Message[] = []

/** チャット（会話単位） */
interface Chat {
  id: string
  title: string
  messages: Message[]
  sessionId: string | null
  todos: TodoItem[]
  archived?: boolean
}

/** タスク（作業単位 = ブランチ） */
interface Task {
  id: string
  title: string
  branchName: string | null
  status: TaskStatus
  chats: Chat[]
  activeChatId: string
  archived?: boolean
}

// ============================================================
// ヘルパー
// ============================================================

function createChat(taskId: string, index: number): Chat {
  const id = `${taskId}-chat-${index}`
  return {
    id,
    title: `Chat ${index}`,
    messages: [],
    sessionId: null,
    todos: [],
    archived: false,
  }
}

function createTask(index: number): Task {
  const id = Date.now().toString()
  const chat = createChat(id, 1)
  return {
    id,
    title: `Task ${index}`,
    branchName: `cmx/task-${id}`,
    status: "idle",
    chats: [chat],
    activeChatId: chat.id,
    archived: false,
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState("")

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)

  // 環境変数の状態
  const [envConfigured, setEnvConfigured] = useState<boolean | null>(null)

  // 開発ブランチの準備状態
  const [branchReady, setBranchReady] = useState<boolean | null>(null)
  const [isCreatingBranch, setIsCreatingBranch] = useState(false)
  const [targetBranchName, setTargetBranchName] = useState("develop")
  const [isDevelopOrDerived, setIsDevelopOrDerived] = useState<boolean>(false)
  const [currentBranch, setCurrentBranch] = useState<string>("")
  const [isSwitchingToDevelop, setIsSwitchingToDevelop] = useState(false)
  const [isSyncingFromDevelop, setIsSyncingFromDevelop] = useState(false)

  // セッション復元済みフラグ
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  // タスク名編集状態
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState("")

  // アーカイブドロップダウン表示状態
  const [showArchivedDropdown, setShowArchivedDropdown] = useState(false)
  const [showArchivedTasksDropdown, setShowArchivedTasksDropdown] = useState(false)

  // アクティブなタスク・チャットを取得
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null
  const activeChat = activeTask
    ? activeTask.chats.find((c) => c.id === activeTask.activeChatId && !c.archived) ??
      activeTask.chats.find((c) => !c.archived) ??
      null
    : null
  const messages = activeChat?.messages ?? EMPTY_MESSAGES

  // スクロールコンテナへの参照
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const previousMessagesLengthRef = useRef(0)
  const shouldAutoScrollRef = useRef(true)
  const scrollRafRef = useRef<number | null>(null)

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
          // chats 配列を持つ有効なタスクのみ復元し、archived プロパティを正規化
          const validTasks = (data.tasks as Task[])
            .filter((t) => t.id && Array.isArray(t.chats) && t.chats.length > 0)
            .map((t) => ({ ...t, archived: !!t.archived }))

          if (validTasks.length > 0) {
            setTasks(validTasks)
            // アーカイブされていないタスクを優先的に選択
            const firstActiveTask = validTasks.find((t) => !t.archived)
            setActiveTaskId(firstActiveTask?.id ?? "")
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

  // チャット切り替え時にスクロール位置をリセット
  useEffect(() => {
    previousMessagesLengthRef.current = 0
    shouldAutoScrollRef.current = true
  }, [activeChat?.id])

  // 自動スクロール機能
  useEffect(() => {
    const canRenderMessages =
      isAuthenticated &&
      envConfigured !== false &&
      branchReady !== false &&
      tasks.length > 0 &&
      messages.length > 0

    if (!canRenderMessages) return

    const container = messagesContainerRef.current
    if (!container) return

    const previousLength = previousMessagesLengthRef.current
    const isInitialLoad = previousLength === 0 && messages.length > 0
    const shouldAutoScroll = isInitialLoad || shouldAutoScrollRef.current

    if (shouldAutoScroll) {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current)
      }

      // 描画完了後の高さで確実に最下部へ
      scrollRafRef.current = requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: isInitialLoad ? "auto" : "smooth",
        })
      })
    }

    previousMessagesLengthRef.current = messages.length
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
    }
  }, [messages, isAuthenticated, envConfigured, branchReady, tasks.length, isLoading])

  // ユーザーが手動で上にスクロールした場合は追従を停止
  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    shouldAutoScrollRef.current = distanceFromBottom < 100
  }

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
          setIsDevelopOrDerived(false)
          return
        }
        setTargetBranchName(data.targetBranch || "develop")
        setCurrentBranch(data.currentBranch || "")
        setIsDevelopOrDerived(data.isDevelopOrDerived ?? false)
        const targetEnv = data.environments?.find(
          (e: { branch: string; exists: boolean }) => e.branch === data.targetBranch
        )
        setBranchReady(targetEnv?.exists ?? false)
      } catch {
        setBranchReady(false)
        setIsDevelopOrDerived(false)
      }
    }
    checkBranch()
  }, [envConfigured, settingsOpen])

  // アーカイブドロップダウンの外側クリックで閉じる（チャット用）
  useEffect(() => {
    if (!showArchivedDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-archived-dropdown]')) {
        setShowArchivedDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showArchivedDropdown])

  // アーカイブドロップダウンの外側クリックで閉じる（タスク用）
  useEffect(() => {
    if (!showArchivedTasksDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-archived-tasks-dropdown]')) {
        setShowArchivedTasksDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showArchivedTasksDropdown])

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
        setIsDevelopOrDerived(true)
      }
    } catch (error) {
      console.error("Failed to create branch:", error)
    } finally {
      setIsCreatingBranch(false)
    }
  }

  // develop ブランチに切り替え
  const handleSwitchToDevelop = async () => {
    setIsSwitchingToDevelop(true)
    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "switch-to-develop",
          taskId: activeTaskId || undefined,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setIsDevelopOrDerived(true)
        setCurrentBranch(targetBranchName)
        // ブランチ情報を再取得
        const statusResponse = await fetch("/api/setup/git")
        const statusData = await statusResponse.json()
        if (!statusData.error) {
          setIsDevelopOrDerived(statusData.isDevelopOrDerived ?? false)
          setCurrentBranch(statusData.currentBranch || "")
        }
      } else {
        alert(`develop への切り替えに失敗しました: ${data.error || "不明なエラー"}`)
      }
    } catch (error) {
      console.error("Failed to switch to develop:", error)
      alert("develop への切り替えに失敗しました。ネットワーク接続を確認してください。")
    } finally {
      setIsSwitchingToDevelop(false)
    }
  }

  // develop から最新を同期（rebase）
  const handleSyncFromDevelop = async () => {
    if (!activeTaskId) return
    setIsSyncingFromDevelop(true)
    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync-from-develop",
          taskId: activeTaskId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert("develop の最新が取り込まれました")
      } else {
        alert(`同期に失敗しました: ${data.error || "不明なエラー"}`)
      }
    } catch (error) {
      console.error("Failed to sync from develop:", error)
      alert("同期に失敗しました")
    } finally {
      setIsSyncingFromDevelop(false)
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
        if (activeTask?.status === "working") {
          updateTask(activeTaskId, (t) => ({ ...t, status: "paused" as const }))
        }
        setActiveTaskId(newTaskId)
      } else {
        console.error("Failed to switch task:", data.error)
        alert(`タスクの切り替えに失敗しました: ${data.error || "不明なエラー"}`)
      }
    } catch (error) {
      console.error("Failed to switch task:", error)
      alert("タスクの切り替えに失敗しました。ネットワーク接続を確認してください。")
    }
  }

  /** 新しいタスクを追加（develop からブランチを即時作成） */
  const addNewTask = async () => {
    if (isCreatingTask || !branchReady) return
    setIsCreatingTask(true)

    try {
      const newTask = createTask(tasks.length + 1)

      if (tasks.length > 0 && activeTaskId) {
        // 既存タスクあり → switch-task（checkpoint + 新ブランチ作成）
        const response = await fetch("/api/setup/git", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "switch-task",
            fromTaskId: activeTaskId,
            toTaskId: newTask.id,
            toBranch: newTask.branchName,
          }),
        })
        const data = await response.json()
        if (!data.success) {
          console.error("Failed to create task:", data.error)
          alert(`タスクの作成に失敗しました: ${data.error || "不明なエラー"}`)
          return
        }
        if (activeTask?.status === "working") {
          updateTask(activeTaskId, (t) => ({ ...t, status: "paused" as const }))
        }
      } else {
        // 最初のタスク → develop から直接ブランチ作成
        const response = await fetch("/api/setup/git", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create-branch", branchName: newTask.branchName }),
        })
        const data = await response.json()
        if (!data.success) {
          console.error("Failed to create branch:", data.error)
          alert(`ブランチの作成に失敗しました: ${data.error || "不明なエラー"}`)
          return
        }
      }

      setTasks((prev) => [...prev, newTask])
      setActiveTaskId(newTask.id)
    } catch (error) {
      console.error("Failed to create task:", error)
      alert("タスクの作成に失敗しました。ネットワーク接続を確認してください。")
    } finally {
      setIsCreatingTask(false)
    }
  }

  /** タスク名の編集を開始 */
  const startEditingTaskTitle = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId)
    setEditingTaskTitle(currentTitle)
  }

  /** タスク名の編集を保存 */
  const saveTaskTitle = () => {
    if (!editingTaskId || !editingTaskTitle.trim()) {
      setEditingTaskId(null)
      setEditingTaskTitle("")
      return
    }

    updateTask(editingTaskId, (task) => ({
      ...task,
      title: editingTaskTitle.trim(),
    }))

    setEditingTaskId(null)
    setEditingTaskTitle("")
  }

  /** タスク名の編集をキャンセル */
  const cancelEditingTaskTitle = () => {
    setEditingTaskId(null)
    setEditingTaskTitle("")
  }

  /** タスクを切り替える（Git ブランチも同時に切り替え） */
  const switchActiveTask = async (toTaskId: string): Promise<boolean> => {
    const toTask = tasks.find((t) => t.id === toTaskId)
    if (!toTask) return false

    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "switch-task",
          fromTaskId: activeTaskId || "system",
          toTaskId,
          toBranch: toTask.branchName,
        }),
      })
      const data = await response.json()
      if (!data.success) {
        console.error("Failed to switch task:", data.error)
        return false
      }

      // 切替元を paused に
      if (activeTask?.status === "working") {
        updateTask(activeTaskId, (t) => ({ ...t, status: "paused" as const }))
      }

      setActiveTaskId(toTaskId)
      return true
    } catch (error) {
      console.error("Failed to switch task:", error)
      return false
    }
  }

  /** タスクをアーカイブする */
  const archiveTask = async (taskId: string) => {
    // タスクをアーカイブ
    updateTask(taskId, (task) => ({ ...task, archived: true, status: "done" as const }))

    // アーカイブ対象がアクティブタスクの場合、別の非アーカイブタスクに切り替え
    const activeTasks = tasks.filter((t) => !t.archived && t.id !== taskId)
    if (activeTasks.length > 0 && activeTaskId === taskId) {
      // Git ブランチも含めて切り替え
      const switched = await switchActiveTask(activeTasks[0].id)
      if (!switched) {
        alert("タスクの切り替えに失敗しました。develop ブランチのままになっています。")
      }
    } else if (activeTasks.length === 0) {
      // すべてのタスクがアーカイブされた場合
      setActiveTaskId("")
    }
  }

  /** アーカイブされたタスクを復元する */
  const restoreTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // まず Git ブランチ切り替えを試行（トランザクション的に）
    const switched = await switchActiveTask(taskId)
    if (!switched) {
      alert("復元に失敗しました。ブランチ切り替えを確認してください。")
      return
    }

    // 切り替え成功後にタスクを復元
    updateTask(taskId, (t) => ({ ...t, archived: false, status: "paused" as const }))
  }

  /** タスク反映（直接マージモード） */
  const handleApplyTask = async () => {
    if (!activeTask?.branchName) return

    // 確認ダイアログを表示
    const confirmed = window.confirm(
      "このタスクを完了します。\n\n" +
      "・変更を develop に反映します\n" +
      "・タスクは「アーカイブ済みタスク」に移動します\n" +
      "・あとで「復元」で再開できます\n\n" +
      "続行しますか？"
    )
    if (!confirmed) return

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
        // 成功したらタスクをアーカイブ（別タスクへの切り替えを待つ）
        await archiveTask(activeTaskId)
        alert("タスクが完了し、develop ブランチに反映されました")
      } else {
        alert(`反映に失敗しました: ${data.error || "不明なエラー"}`)
      }
    } catch (error) {
      console.error("Failed to apply task:", error)
      alert("反映に失敗しました")
    }
  }

  /** タスクブランチをプッシュ（PR モード） */
  const handlePushTask = async () => {
    if (!activeTask?.branchName) return

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
    const newChat = createChat(activeTaskId, activeTask.chats.length + 1)
    updateTask(activeTaskId, (task) => ({
      ...task,
      chats: [...task.chats, newChat],
      activeChatId: newChat.id,
    }))
  }

  /** チャットをアーカイブする */
  const archiveChat = (chatId: string) => {
    if (!activeTask) return

    // チャットをアーカイブ
    updateChat(chatId, (chat) => ({ ...chat, archived: true }))

    // アーカイブ対象がアクティブチャットの場合、別の非アーカイブチャットに切り替え
    const activeChats = activeTask.chats.filter((c) => !c.archived && c.id !== chatId)
    if (activeChats.length > 0 && activeTask.activeChatId === chatId) {
      updateTask(activeTaskId, (task) => ({
        ...task,
        activeChatId: activeChats[0].id,
      }))
    }
  }

  /** アーカイブされたチャットを復元する */
  const restoreChat = (chatId: string) => {
    if (!activeTask) return
    updateChat(chatId, (chat) => ({ ...chat, archived: false }))
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

      // コマンドの内容を直接送信
      if (data.content) {
        await sendMessage(data.content)
      }
    } catch (error) {
      console.error("Failed to execute command:", error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !isAuthenticated || !activeTask || !activeChat) return

    const userMessage: Message = { role: "user", content: message }
    updateMessages((prev) => [...prev, userMessage])

    // Auto-set chat title from first message
    if (activeChat.messages.length === 0) {
      const title = message.slice(0, 40) + (message.length > 40 ? "..." : "")
      updateChat(activeChat.id, (chat) => ({ ...chat, title }))
    }

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

                  // 既存のアシスタントメッセージがある場合
                  if (lastMessage?.role === "assistant") {
                    // 新しいテキストが前回より長い場合のみ更新（ストリーミング）
                    if (data.content && data.content.length > lastMessage.content.length) {
                      lastMessage.content = data.content
                    } else if (data.content && data.content !== lastMessage.content) {
                      // 完全に異なるテキストの場合は上書き
                      lastMessage.content = data.content
                    }
                  } else {
                    // 新しいアシスタントメッセージを追加
                    newMessages.push({
                      role: "assistant",
                      content: data.content || "",
                    })
                  }
                  return newMessages
                })
              } else if (data.type === "tool_use") {
                updateMessages((prev) => [
                  ...prev,
                  {
                    role: "tool" as const,
                    content: data.toolInput ? JSON.stringify(data.toolInput, null, 2) : "",
                    toolName: data.toolName,
                    toolStatus: "pending" as const,
                  },
                ])
              } else if (data.type === "tool_result") {
                updateMessages((prev) => {
                  const newMessages = [...prev]
                  const lastTool = newMessages.findLast((m) => m.role === "tool" && m.toolStatus === "pending")
                  if (lastTool) {
                    lastTool.toolStatus = "completed"
                    // ツールの結果がある場合は content を更新
                    if (data.toolResult) {
                      const resultStr = typeof data.toolResult === "string"
                        ? data.toolResult
                        : JSON.stringify(data.toolResult, null, 2)
                      lastTool.content = resultStr
                    }
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
    // Shift + Enter: 改行（デフォルト動作）
    if (e.shiftKey && e.key === "Enter") {
      return
    }
    // Enter のみ: 送信
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        handleSubmit(e)
      }
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
        return "bg-muted"
    }
  }

  // ============================================================
  // レンダリング
  // ============================================================

  return (
    <div className="flex flex-col h-full">

      {/* タスクバー（タスク切り替え + ステータス）— develop ブランチ準備完了時のみ表示 */}
      {isAuthenticated && envConfigured && branchReady && isDevelopOrDerived && (
        <div className="border-b border-border bg-secondary px-2 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          <FolderGit2 className="w-3 h-3 text-muted-foreground flex-shrink-0 mr-1.5" />
          {tasks.filter((t) => !t.archived).map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                activeTaskId === task.id
                  ? "bg-muted text-foreground border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotClass(task.status)}`} />
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  onBlur={saveTaskTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveTaskTitle()
                    } else if (e.key === "Escape") {
                      cancelEditingTaskTitle()
                    }
                  }}
                  autoFocus
                  className="bg-muted border border-input rounded px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-[80px]"
                />
              ) : (
                <span
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleTaskSwitch(task.id)}
                  onDoubleClick={() => startEditingTaskTitle(task.id, task.title)}
                  title="ダブルクリックで編集"
                >
                  {task.title}
                </span>
              )}
            </div>
          ))}
          <button
            onClick={addNewTask}
            className="flex-shrink-0 px-2 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="新しいタスクを開く"
            disabled={isLoading || isCreatingTask}
          >
            {isCreatingTask ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
          {tasks.filter((t) => t.archived).length > 0 && (
            <div className="relative" data-archived-tasks-dropdown>
              <button
                onClick={() => setShowArchivedTasksDropdown(!showArchivedTasksDropdown)}
                className="flex-shrink-0 flex items-center gap-1 px-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                title="アーカイブされたタスク"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{tasks.filter((t) => t.archived).length}</span>
              </button>
              {showArchivedTasksDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded shadow-lg z-10 min-w-[200px]">
                  <div className="p-2 border-b border-border">
                    <div className="text-xs font-medium text-muted-foreground">アーカイブ済みタスク</div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {tasks.filter((t) => t.archived).map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between px-3 py-2 hover:bg-accent text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1 truncate">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotClass(task.status)}`} />
                          <span className="text-foreground truncate">{task.title}</span>
                        </div>
                        <button
                          onClick={() => {
                            restoreTask(task.id)
                            setShowArchivedTasksDropdown(false)
                          }}
                          className="ml-2 p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                          title="復元"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* タスクヘッダー: ブランチ状態 + アクションボタン（環境準備完了時のみ） */}
      {isAuthenticated && envConfigured && branchReady && isDevelopOrDerived && activeTask && (
        <div className="border-b border-border">
          <DeployPanel
            onSendMessage={sendMessage}
            isLoading={isLoading}
            currentTaskBranch={activeTask.branchName}
            taskStatus={activeTask.status}
            onApplyTask={handleApplyTask}
            onPushTask={handlePushTask}
            onSyncFromDevelop={handleSyncFromDevelop}
            isSyncingFromDevelop={isSyncingFromDevelop}
            onSwitchToDevelop={handleSwitchToDevelop}
            isSwitchingToDevelop={isSwitchingToDevelop}
          />
        </div>
      )}

      {/* チャットタブ（タスク内の会話切り替え） */}
      {isAuthenticated && envConfigured && branchReady && isDevelopOrDerived && activeTask && (
        <div className="border-b border-border bg-secondary px-2 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          <MessageSquareText className="w-3 h-3 text-muted-foreground flex-shrink-0 mr-1.5" />
          {activeTask.chats.filter((c) => !c.archived).map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                activeTask.activeChatId === chat.id
                  ? "text-foreground bg-muted border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleChatSwitch(chat.id)}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                activeTask.activeChatId === chat.id ? "bg-green-500" : "bg-muted"
              }`} />
              <span className="whitespace-nowrap">{chat.title}</span>
              {activeTask.chats.filter((c) => !c.archived).length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    archiveChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-accent rounded p-0.5 transition-opacity"
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
            className="flex-shrink-0 px-1.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="新しいチャットを追加"
          >
            <Plus className="w-3 h-3" />
          </button>
          {activeTask.chats.filter((c) => c.archived).length > 0 && (
            <div className="relative" data-archived-dropdown>
              <button
                onClick={() => setShowArchivedDropdown(!showArchivedDropdown)}
                className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                title="アーカイブされたチャット"
              >
                <Archive className="w-3 h-3" />
                <span>{activeTask.chats.filter((c) => c.archived).length}</span>
              </button>
              {showArchivedDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded shadow-lg z-10 min-w-[200px]">
                  <div className="p-2 border-b border-border">
                    <div className="text-xs font-medium text-muted-foreground">アーカイブ済み</div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {activeTask.chats.filter((c) => c.archived).map((chat) => (
                      <div
                        key={chat.id}
                        className="group flex items-center justify-between px-3 py-2 hover:bg-accent text-xs"
                      >
                        <span className="text-foreground truncate flex-1">{chat.title}</span>
                        <button
                          onClick={() => {
                            restoreChat(chat.id)
                            setShowArchivedDropdown(false)
                          }}
                          className="ml-2 p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                          title="復元"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* メッセージリスト（チャット専用） */}
      <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto bg-background leading-relaxed">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
             <div className="p-4 bg-muted rounded-lg max-w-md w-full">
                <p className="font-semibold text-foreground mb-2">Authentication Required</p>
                <p className="text-sm mb-4">Please login to Claude Code to continue.</p>
                <code className="block bg-secondary text-foreground p-3 rounded text-xs">claude-code login</code>
             </div>
          </div>
        ) : envConfigured === false ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto my-8">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                   <h3 className="font-semibold text-amber-900 mb-1">Missing Configuration</h3>
                   <p className="text-amber-800 text-sm mb-3">Environment variables are not configured.</p>
                   <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-500/20" onClick={() => onSettingsOpenChange(true)}>
                     Configure
                   </Button>
                </div>
              </div>
          </div>
        ) : branchReady === false ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="p-4 bg-muted rounded-lg max-w-md w-full space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
                <p className="font-semibold text-foreground">開発ブランチのセットアップ</p>
              </div>
              <p className="text-sm text-muted-foreground">
                変更管理を開始するには、開発ブランチ（<code className="bg-secondary px-1 rounded text-xs">{targetBranchName}</code>）を作成してください。
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
        ) : !isDevelopOrDerived ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md w-full space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="font-semibold text-amber-900">開発ブランチに切り替えてください</p>
              </div>
              <p className="text-sm text-amber-800">
                現在のブランチ（<code className="bg-amber-500/20 px-1 rounded text-xs">{currentBranch}</code>）では Studio を使用できません。
                開発ブランチ（<code className="bg-amber-500/20 px-1 rounded text-xs">{targetBranchName}</code>）またはその派生ブランチに切り替える必要があります。
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 bg-white border-amber-200 text-amber-900 hover:bg-amber-500/20"
                onClick={handleSwitchToDevelop}
                disabled={isSwitchingToDevelop}
              >
                {isSwitchingToDevelop ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitBranch className="w-3.5 h-3.5" />
                )}
                {isSwitchingToDevelop ? "切り替え中..." : `${targetBranchName} に切り替え`}
              </Button>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="p-4 bg-muted rounded-lg max-w-md w-full space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-muted-foreground" />
                <p className="font-semibold text-foreground">タスクを作成してください</p>
              </div>
              <p className="text-sm text-muted-foreground">
                開発ブランチ（<code className="bg-secondary px-1 rounded text-xs">{targetBranchName}</code>）の準備ができました。
                タスクを作成すると、開発ブランチから派生ブランチが作成され、作業を開始できます。
              </p>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={addNewTask}
                disabled={isCreatingTask}
              >
                {isCreatingTask ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {isCreatingTask ? "作成中..." : "最初のタスクを作成"}
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Terminal className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Ready to assist. Type a command or request.</p>
          </div>
        ) : (
          <div className="space-y-1 max-w-3xl mx-auto pb-[20vh]">
            {messages.map((message, index) => (
              <MessageEntryComponent
                key={index}
                entry={{ ...message, isLast: index === messages.length - 1 }}
                index={index}
              />
            ))}

            {/* AI考え中インジケーター */}
            {isLoading && (
              <div className="flex items-start gap-3 px-4 py-2">
                {/* タイムライン */}
                <div className="relative flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-muted-foreground/40" />
                </div>

                <div className="flex-1 pb-1">
                  <LumaSpin />
                </div>
              </div>
            )}

            {/* Todo Panel */}
            {activeChat?.todos && activeChat.todos.length > 0 && (
              <div className="mt-4">
                <TodoPanel todos={activeChat.todos} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="p-4 bg-secondary border-t border-border">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            <AutoResizeTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!isAuthenticated || !envConfigured || !branchReady || tasks.length === 0 ? "System unavailable" : "Type instructions..."}
              className="bg-muted"
              disabled={isLoading || !isAuthenticated || !envConfigured || !branchReady || tasks.length === 0}
              maxHeight={200}
            />
            <div className="flex items-center justify-between gap-2">
              {tasks.length > 0 && (
                <CommandMenu onCommandSelect={handleCommandSelect} />
              )}
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !isAuthenticated || !envConfigured || !branchReady || tasks.length === 0}
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-auto"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </form>
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
