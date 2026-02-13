"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SiteConfig = {
  siteName?: string
  siteUrl?: string
  language?: string
  siteType?: string
}

interface SiteSetupFormProps {
  initialValues?: SiteConfig
  onComplete?: () => void
}

const SITE_TYPES = [
  { value: "corporate", label: "コーポレート" },
  { value: "blog", label: "ブログ" },
  { value: "lp", label: "ランディングページ" },
  { value: "ec", label: "EC" },
  { value: "docs", label: "ドキュメント" },
  { value: "media", label: "メディア" },
]

const LANGUAGES = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
]

/**
 * サイト基本設定フォームコンポーネント
 */
export function SiteSetupForm({
  initialValues = {},
  onComplete,
}: SiteSetupFormProps) {
  const [values, setValues] = useState<SiteConfig>({
    siteName: initialValues.siteName || "",
    siteUrl: initialValues.siteUrl || "",
    language: initialValues.language || "ja",
    siteType: initialValues.siteType || "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (key: keyof SiteConfig, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!values.siteName?.trim()) {
      setError("サイト名を入力してください")
      return
    }

    if (!values.siteUrl?.trim()) {
      setError("サイトURLを入力してください")
      return
    }

    if (!values.siteType) {
      setError("サイト種別を選択してください")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/setup/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "サイト設定の保存に失敗しました")
      }

      setSuccess(true)
      onComplete?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "サイト設定の保存に失敗しました"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">サイト基本設定</h2>
        <p className="text-sm text-muted-foreground">
          サイトの基本情報を設定してください
        </p>
      </div>

      {/* サイト名 */}
      <div className="space-y-2">
        <label htmlFor="siteName" className="text-sm font-medium">
          サイト名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="siteName"
          type="text"
          value={values.siteName}
          onChange={(e) => handleChange("siteName", e.target.value)}
          placeholder="例: CMX Starter Kit"
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          サイトのタイトルやロゴに表示される名前です
        </p>
      </div>

      {/* サイトURL */}
      <div className="space-y-2">
        <label htmlFor="siteUrl" className="text-sm font-medium">
          サイト URL <span className="text-red-500">*</span>
        </label>
        <Input
          id="siteUrl"
          type="url"
          value={values.siteUrl}
          onChange={(e) => handleChange("siteUrl", e.target.value)}
          placeholder="https://example.com"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          公開時の本番環境のURLを入力してください
        </p>
      </div>

      {/* サイト種別 */}
      <div className="space-y-2">
        <label htmlFor="siteType" className="text-sm font-medium">
          サイト種別 <span className="text-red-500">*</span>
        </label>
        <Select
          value={values.siteType}
          onValueChange={(value) => handleChange("siteType", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="サイト種別を選択" />
          </SelectTrigger>
          <SelectContent>
            {SITE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          サイトの種類に応じたテンプレートやガイドが提供されます
        </p>
      </div>

      {/* 言語 */}
      <div className="space-y-2">
        <label htmlFor="language" className="text-sm font-medium">
          言語
        </label>
        <Select
          value={values.language}
          onValueChange={(value) => handleChange("language", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          サイトの主要言語を選択してください
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 成功表示 */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">
            ✓ サイト設定を保存しました
          </p>
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex gap-3 pt-4">
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
