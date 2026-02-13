"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"

type AuthStatusData = {
  authenticated: boolean
  user?: {
    name: string
    email: string
  }
}

/**
 * 認証状態表示・認証ボタンコンポーネント
 */
export function AuthStatus() {
  const [status, setStatus] = useState<AuthStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // 認証状態を取得
  const fetchAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to fetch auth status:", error)
      setStatus({ authenticated: false })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuthStatus()
  }, [])

  // OAuth Handoff開始
  const handleAuthenticate = async () => {
    setIsAuthenticating(true)

    try {
      const response = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "claude_code" }),
      })

      if (!response.ok) {
        throw new Error("認証開始に失敗しました")
      }

      const data = await response.json()
      const { authorizeUrl } = data

      // 認証ウィンドウを開く
      const authWindow = window.open(
        authorizeUrl,
        "claude-code-auth",
        "width=600,height=700,menubar=no,toolbar=no,location=no"
      )

      // ポーリングで認証完了を監視
      const interval = setInterval(async () => {
        if (authWindow?.closed) {
          clearInterval(interval)
          setIsAuthenticating(false)

          // 認証状態を再取得
          await fetchAuthStatus()
        }
      }, 500)

      // 5分後にタイムアウト
      setTimeout(() => {
        clearInterval(interval)
        setIsAuthenticating(false)
        if (authWindow && !authWindow.closed) {
          authWindow.close()
        }
      }, 5 * 60 * 1000)
    } catch (error) {
      console.error("Authentication failed:", error)
      setIsAuthenticating(false)
      alert("認証に失敗しました")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        読み込み中...
      </div>
    )
  }

  if (status?.authenticated && status.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <div className="text-sm">
            <div className="font-medium">{status.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {status.user.email}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAuthStatus}
          className="ml-2"
        >
          更新
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-gray-400" />
        未認証
      </div>
      <LoadingButton
        onClick={handleAuthenticate}
        loading={isAuthenticating}
        size="sm"
      >
        Claude Code で認証
      </LoadingButton>
    </div>
  )
}
