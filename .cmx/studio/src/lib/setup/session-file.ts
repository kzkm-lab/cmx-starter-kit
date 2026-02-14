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

export interface ChatTab {
  id: string
  title: string
  messages: Message[]
  sessionId: string | null
}

const SESSION_FILE = path.join(process.env.HOME || "/tmp", ".cmx-dev-sessions.json")

/**
 * すべてのタブ情報をファイルに保存
 */
export async function saveTabs(tabs: ChatTab[]): Promise<void> {
  try {
    await fs.writeFile(SESSION_FILE, JSON.stringify(tabs, null, 2), "utf-8")
  } catch (error) {
    console.error("Failed to save tabs to file:", error)
  }
}

/**
 * ファイルからタブ情報を復元
 */
export async function loadTabs(): Promise<ChatTab[] | null> {
  try {
    const data = await fs.readFile(SESSION_FILE, "utf-8")
    const tabs = JSON.parse(data) as ChatTab[]
    return tabs
  } catch (error) {
    // ファイルが存在しない場合は null を返す
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null
    }
    console.error("Failed to load tabs from file:", error)
    return null
  }
}

/**
 * セッションファイルをクリア
 */
export async function clearTabs(): Promise<void> {
  try {
    await fs.unlink(SESSION_FILE)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to clear tabs file:", error)
    }
  }
}
