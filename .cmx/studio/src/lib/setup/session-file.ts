import { promises as fs } from "fs"
import path from "path"

/**
 * セッション情報のファイルシステム管理
 * .cmx/studio/sessions/ にタスクごとのファイルを保存
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
  /** アーカイブ状態 */
  archived?: boolean
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
  /** アーカイブ状態 */
  archived?: boolean
}

/**
 * セッションディレクトリのパスを取得
 */
function getSessionsDir(): string {
  return path.join(process.cwd(), "sessions")
}

/**
 * セッションディレクトリを作成（存在しなければ）
 */
async function ensureSessionsDir(): Promise<void> {
  const dir = getSessionsDir()
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    console.error("Failed to create sessions directory:", error)
  }
}

/**
 * タスクファイルのパスを取得
 */
function getTaskFilePath(taskId: string): string {
  return path.join(getSessionsDir(), `task-${taskId}.json`)
}

/**
 * タスクをファイルに保存
 */
export async function saveTask(task: Task): Promise<void> {
  try {
    await ensureSessionsDir()
    const filePath = getTaskFilePath(task.id)
    await fs.writeFile(filePath, JSON.stringify(task, null, 2), "utf-8")
  } catch (error) {
    console.error(`Failed to save task ${task.id} to file:`, error)
  }
}

/**
 * すべてのタスク情報をファイルに保存
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  await ensureSessionsDir()
  await Promise.all(tasks.map((task) => saveTask(task)))
}

/**
 * タスクファイルを削除
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const filePath = getTaskFilePath(taskId)
    await fs.unlink(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Failed to delete task file ${taskId}:`, error)
    }
  }
}

/**
 * ファイルからすべてのタスク情報を復元
 */
export async function loadTasks(): Promise<Task[] | null> {
  try {
    const dir = getSessionsDir()

    // ディレクトリが存在しなければ null を返す
    try {
      await fs.access(dir)
    } catch {
      return null
    }

    const files = await fs.readdir(dir)
    const taskFiles = files.filter((f) => f.startsWith("task-") && f.endsWith(".json"))

    if (taskFiles.length === 0) {
      return null
    }

    const tasks: Task[] = []
    for (const file of taskFiles) {
      try {
        const filePath = path.join(dir, file)
        const data = await fs.readFile(filePath, "utf-8")
        const task = JSON.parse(data) as Task
        tasks.push(task)
      } catch (error) {
        console.error(`Failed to load task from ${file}:`, error)
      }
    }

    // タスク ID でソート（作成順）
    tasks.sort((a, b) => a.id.localeCompare(b.id))

    return tasks.length > 0 ? tasks : null
  } catch (error) {
    console.error("Failed to load tasks from directory:", error)
    return null
  }
}

/**
 * すべてのセッションファイルをクリア
 */
export async function clearTasks(): Promise<void> {
  try {
    const dir = getSessionsDir()
    const files = await fs.readdir(dir)
    const taskFiles = files.filter((f) => f.startsWith("task-") && f.endsWith(".json"))

    await Promise.all(taskFiles.map((file) => fs.unlink(path.join(dir, file))))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to clear tasks directory:", error)
    }
  }
}
