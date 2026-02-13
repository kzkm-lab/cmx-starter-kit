import { loadCredentials, saveCredentials, isTokenExpired, type Credentials } from "./token-store"

/**
 * Claude Code API クライアント
 * OAuth Handoff フローとトークン管理を担当
 */

/**
 * Claude Code API のベースURL
 * 環境変数で上書き可能（テスト用）
 */
const CLAUDE_CODE_API_BASE =
  process.env.CLAUDE_CODE_API_BASE || "https://api.claude.ai/v1"

/**
 * OAuth Handoff 初期化リクエスト
 */
export interface HandoffInitRequest {
  provider: string // "claude-code"
  returnTo: string // コールバックURL
  appChallenge: string // SHA-256 challenge
}

/**
 * OAuth Handoff 初期化レスポンス
 */
export interface HandoffInitResponse {
  handoffId: string
  authorizeUrl: string
}

/**
 * OAuth Handoff 完了リクエスト
 */
export interface HandoffRedeemRequest {
  handoffId: string
  appCode: string
  appVerifier: string
}

/**
 * OAuth Handoff 完了レスポンス
 */
export interface HandoffRedeemResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number // seconds
}

/**
 * ユーザープロフィール
 */
export interface UserProfile {
  userId: string
  email: string
  name?: string
}

/**
 * Claude Code APIクライアント
 */
export class ClaudeCodeClient {
  private baseUrl: string

  constructor(baseUrl: string = CLAUDE_CODE_API_BASE) {
    this.baseUrl = baseUrl
  }

  /**
   * OAuth Handoff を開始
   */
  async handoffInit(request: HandoffInitRequest): Promise<HandoffInitResponse> {
    const response = await fetch(`${this.baseUrl}/auth/handoff/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`OAuth Handoff init failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * OAuth Handoff を完了（トークン取得）
   */
  async handoffRedeem(request: HandoffRedeemRequest): Promise<HandoffRedeemResponse> {
    const response = await fetch(`${this.baseUrl}/auth/handoff/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`OAuth Handoff redeem failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * アクセストークンを取得（自動リフレッシュ）
   */
  async getAccessToken(): Promise<string> {
    const credentials = await loadCredentials()

    if (!credentials) {
      throw new Error("Not authenticated")
    }

    // トークンが有効期限内ならそのまま返す
    if (!isTokenExpired(credentials)) {
      return credentials.accessToken
    }

    // リフレッシュトークンがない場合はエラー
    if (!credentials.refreshToken) {
      throw new Error("Token expired and no refresh token available")
    }

    // トークンをリフレッシュ
    return this.refreshAccessToken(credentials.refreshToken)
  }

  /**
   * トークンをリフレッシュ
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    const data = await response.json()
    const newCredentials: Credentials = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || refreshToken,
      expiresAt: data.expiresIn
        ? new Date(Date.now() + data.expiresIn * 1000).toISOString()
        : undefined,
    }

    await saveCredentials(newCredentials)
    return newCredentials.accessToken
  }

  /**
   * ユーザープロフィールを取得
   */
  async getUserProfile(): Promise<UserProfile> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * ログアウト（トークンを無効化）
   */
  async logout(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken()

      await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch {
      // トークンが無効な場合は無視
    }
  }
}

/**
 * デフォルトのクライアントインスタンス
 */
export const claudeCodeClient = new ClaudeCodeClient()
