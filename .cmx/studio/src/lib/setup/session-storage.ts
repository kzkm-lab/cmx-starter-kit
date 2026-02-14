/**
 * セッション情報の localStorage 管理
 * ブラウザリロード後も会話履歴を復元できるようにする
 */

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

/** タスクの状態 */
export type TaskStatus = "idle" | "working" | "paused" | "done"

/** チャット（会話単位） */
export interface Chat {
  id: string
  title: string
  messages: Message[]
  /** Claude Code セッション ID */
  sessionId: string | null
}

/** タスク（作業単位 = ブランチ） */
export interface Task {
  id: string
  title: string
  /** 紐づくブランチ名（例: cmx/task-{id}）。null = develop 上で直接作業 */
  branchName: string | null
  /** タスクの状態 */
  status: TaskStatus
  /** タスク内のチャット一覧 */
  chats: Chat[]
  /** アクティブなチャットの ID */
  activeChatId: string
}

const STORAGE_KEY = "cmx-dev-chat-sessions"

/**
 * すべてのタスク情報を localStorage に保存
 */
export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error)
  }
}

/**
 * localStorage からタスク情報を復元
 */
export function loadTasks(): Task[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const tasks = JSON.parse(stored) as Task[]
    return tasks
  } catch (error) {
    console.error("Failed to load tasks from localStorage:", error)
    return null
  }
}

/**
 * localStorage のタスク情報をクリア
 */
export function clearTasks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear tasks from localStorage:", error)
  }
}
