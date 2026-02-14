"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Eye, EyeOff } from "lucide-react"

type EnvVars = {
  CMX_API_KEY?: string
  CMX_API_URL?: string
  NEXT_PUBLIC_SITE_URL?: string
}

interface EnvSetupFormProps {
  initialValues?: EnvVars
  onComplete?: () => void
}

/**
 * 環境変数設定フォーム
 */
export function EnvSetupForm({
  initialValues = {},
  onComplete,
}: EnvSetupFormProps) {
  const [values, setValues] = useState<EnvVars>({
    CMX_API_KEY: initialValues.CMX_API_KEY || "",
    CMX_API_URL: initialValues.CMX_API_URL || "https://stg.cmx-ai.org",
    NEXT_PUBLIC_SITE_URL:
      initialValues.NEXT_PUBLIC_SITE_URL || "http://localhost:4000",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (key: keyof EnvVars, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!values.CMX_API_KEY?.trim()) {
      setError("CMX API Key は必須です")
      return
    }

    if (!values.CMX_API_URL?.trim()) {
      setError("CMX API URL は必須です")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/setup/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ env: values }),
      })

      if (!response.ok) {
        throw new Error("環境変数の保存に失敗しました")
      }

      setSuccess(true)

      // 完了コールバックを呼び出す
      setTimeout(() => {
        onComplete?.()
      }, 1000)
    } catch (err) {
      console.error("Failed to save env:", err)
      setError(
        err instanceof Error ? err.message : "環境変数の保存に失敗しました"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">環境変数の設定</h2>
        <p className="text-sm text-muted-foreground">
          CMX と連携するために必要な環境変数を設定してください
        </p>
      </div>

      {/* CMX API Key */}
      <div className="space-y-2">
        <label htmlFor="CMX_API_KEY" className="text-sm font-medium">
          CMX API Key <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="CMX_API_KEY"
            type={showPassword ? "text" : "password"}
            value={values.CMX_API_KEY}
            onChange={(e) => handleChange("CMX_API_KEY", e.target.value)}
            placeholder="api_xxxxx_..."
            className="font-mono text-sm pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          CMX Admin の設定画面から取得してください
        </p>
      </div>

      {/* CMX API URL */}
      <div className="space-y-2">
        <label htmlFor="CMX_API_URL" className="text-sm font-medium">
          CMX API URL <span className="text-red-500">*</span>
        </label>
        <Input
          id="CMX_API_URL"
          type="url"
          value={values.CMX_API_URL}
          onChange={(e) => handleChange("CMX_API_URL", e.target.value)}
          placeholder="https://your-cmx-admin.example.com"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          CMX Admin の URL を入力してください
        </p>
      </div>

      {/* Site URL */}
      <div className="space-y-2">
        <label htmlFor="NEXT_PUBLIC_SITE_URL" className="text-sm font-medium">
          サイト URL
        </label>
        <Input
          id="NEXT_PUBLIC_SITE_URL"
          type="url"
          value={values.NEXT_PUBLIC_SITE_URL}
          onChange={(e) =>
            handleChange("NEXT_PUBLIC_SITE_URL", e.target.value)
          }
          placeholder="http://localhost:4000"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          サイトの公開 URL（本番環境では変更してください）
        </p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 成功メッセージ */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">環境変数を保存しました！</p>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex gap-3">
        <LoadingButton
          type="submit"
          loading={isSaving}
          disabled={isSaving}
          className="flex-1"
        >
          保存して続ける
        </LoadingButton>
      </div>
    </form>
  )
}
