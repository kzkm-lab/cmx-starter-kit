/**
 * セッション情報の localStorage 管理
 * ブラウザリロード後も会話履歴を復元できるようにする
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

const STORAGE_KEY = "cmx-dev-chat-sessions"

/**
 * すべてのタブ情報を localStorage に保存
 */
export function saveTabs(tabs: ChatTab[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
  } catch (error) {
    console.error("Failed to save tabs to localStorage:", error)
  }
}

/**
 * localStorage からタブ情報を復元
 */
export function loadTabs(): ChatTab[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const tabs = JSON.parse(stored) as ChatTab[]
    return tabs
  } catch (error) {
    console.error("Failed to load tabs from localStorage:", error)
    return null
  }
}

/**
 * localStorage のタブ情報をクリア
 */
export function clearTabs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear tabs from localStorage:", error)
  }
}

/**
 * 特定のタブ情報を更新
 */
export function updateTab(tabId: string, updater: (tab: ChatTab) => ChatTab): void {
  const tabs = loadTabs()
  if (!tabs) return

  const updatedTabs = tabs.map((tab) =>
    tab.id === tabId ? updater(tab) : tab
  )

  saveTabs(updatedTabs)
}
