"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type AuthStatusData = {
  authenticated: boolean
}

/**
 * 認証状態表示コンポーネント（簡略版）
 *
 * ~/.claude.json の存在を確認し、ログイン状態を表示
 */
export function AuthStatus() {
  const [status, setStatus] = useState<AuthStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        読み込み中...
      </div>
    )
  }

  if (status?.authenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <div className="text-sm font-medium">ログイン済み</div>
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
        <div className="h-2 w-2 rounded-full bg-red-500" />
        未ログイン
      </div>
    </div>
  )
}
