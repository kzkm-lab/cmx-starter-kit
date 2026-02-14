"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react"

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
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-muted">
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span className="text-xs font-medium text-muted-foreground">読み込み中...</span>
      </div>
    )
  }

  if (status?.authenticated) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs font-medium text-foreground">Authenticated</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAuthStatus}
          className="h-7 w-7 p-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted">
      <XCircle className="h-3.5 w-3.5 text-red-400" />
      <span className="text-xs font-medium text-foreground">Not authenticated</span>
    </div>
  )
}
