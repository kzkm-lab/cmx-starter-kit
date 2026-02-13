import { randomBytes, createHash } from "crypto"

/**
 * PKCE認証フロー用のユーティリティ
 * vibe-kanbanのOAuth Handoffパターンを参考にした独自実装
 */

/**
 * ランダムな verifier を生成（64文字の英数字）
 */
export function generateVerifier(): string {
  return randomBytes(64)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 64)
}

/**
 * verifier から SHA-256 challenge を計算
 */
export function generateChallenge(verifier: string): string {
  const hash = createHash("sha256").update(verifier).digest("hex")
  return hash
}

/**
 * OAuth Handoff セッション
 */
export interface OAuthHandoffSession {
  handoffId: string
  verifier: string
  provider: string
  createdAt: number
}

/**
 * OAuth Handoff セッションストア（メモリ）
 */
class OAuthHandoffStore {
  private sessions = new Map<string, OAuthHandoffSession>()

  /**
   * セッションを保存
   */
  store(handoffId: string, verifier: string, provider: string): void {
    this.sessions.set(handoffId, {
      handoffId,
      verifier,
      provider,
      createdAt: Date.now(),
    })

    // 10分後に自動削除
    setTimeout(() => {
      this.sessions.delete(handoffId)
    }, 10 * 60 * 1000)
  }

  /**
   * セッションを取得して削除（1回限り）
   */
  take(handoffId: string): OAuthHandoffSession | undefined {
    const session = this.sessions.get(handoffId)
    if (session) {
      this.sessions.delete(handoffId)
    }
    return session
  }

  /**
   * セッションをクリア（テスト用）
   */
  clear(): void {
    this.sessions.clear()
  }
}

export const oauthHandoffStore = new OAuthHandoffStore()
