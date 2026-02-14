import { promises as fs } from "fs"
import path from "path"

/**
 * セッション情報のファイルシステム管理
 * ~/.cmx-dev-sessions.json にセッション情報を保存
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

const SESSION_FILE = path.join(process.env.HOME || "/tmp", ".cmx-dev-sessions.json")

/**
 * すべてのタスク情報をファイルに保存
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await fs.writeFile(SESSION_FILE, JSON.stringify(tasks, null, 2), "utf-8")
  } catch (error) {
    console.error("Failed to save tasks to file:", error)
  }
}

/**
 * ファイルからタスク情報を復元
 */
export async function loadTasks(): Promise<Task[] | null> {
  try {
    const data = await fs.readFile(SESSION_FILE, "utf-8")
    const tasks = JSON.parse(data) as Task[]
    return tasks
  } catch (error) {
    // ファイルが存在しない場合は null を返す
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null
    }
    console.error("Failed to load tasks from file:", error)
    return null
  }
}

/**
 * セッションファイルをクリア
 */
export async function clearTasks(): Promise<void> {
  try {
    await fs.unlink(SESSION_FILE)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to clear tasks file:", error)
    }
  }
}
