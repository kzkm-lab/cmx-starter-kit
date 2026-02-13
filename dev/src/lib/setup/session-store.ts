/**
 * セッションストア（サーバー側メモリ内）
 * 本番環境では Redis や データベースに置き換えることを推奨
 */

interface Session {
  id: string
  createdAt: number
  lastAccessedAt: number
}

const sessions = new Map<string, Session>()

/**
 * 新しいセッションを作成
 */
export function createSession(): string {
  const sessionId = crypto.randomUUID()
  const now = Date.now()

  sessions.set(sessionId, {
    id: sessionId,
    createdAt: now,
    lastAccessedAt: now,
  })

  return sessionId
}

/**
 * セッションの存在確認
 */
export function hasSession(sessionId: string): boolean {
  return sessions.has(sessionId)
}

/**
 * セッションのアクセス時刻を更新
 */
export function touchSession(sessionId: string): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.lastAccessedAt = Date.now()
  }
}

/**
 * セッションを削除
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

/**
 * 古いセッションを削除（30分以上アクセスがないもの）
 */
export function cleanupOldSessions(): void {
  const now = Date.now()
  const THIRTY_MINUTES = 30 * 60 * 1000

  for (const [id, session] of sessions.entries()) {
    if (now - session.lastAccessedAt > THIRTY_MINUTES) {
      sessions.delete(id)
    }
  }
}

// 定期的にクリーンアップ（5分ごと）
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldSessions, 5 * 60 * 1000)
}
