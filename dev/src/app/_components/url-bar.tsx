"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UrlBarProps {
  url: string
  onNavigate: (url: string) => void
  onBack?: () => void
  onForward?: () => void
  onRefresh?: () => void
  onHome?: () => void
}

/**
 * カスタム URL バーコンポーネント
 * ブラウザライクな URL 表示・編集・ナビゲーション機能
 */
export function UrlBar({
  url,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onHome,
}: UrlBarProps) {
  const [editingUrl, setEditingUrl] = useState(url)

  useEffect(() => {
    setEditingUrl(url)
  }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUrl) {
      onNavigate(editingUrl)
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b-[4px] border-slate-900">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={onBack}
          disabled={!onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={onForward}
          disabled={!onForward}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={onHome}
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative group">
          <Input
            value={editingUrl}
            onChange={(e) => setEditingUrl(e.target.value)}
            className="h-9 bg-slate-50/50 border-transparent hover:border-slate-200 focus:bg-white focus:border-slate-300 transition-all text-sm text-slate-700 shadow-sm font-medium placeholder:text-slate-400"
            placeholder="Enter URL..."
          />
        </div>
      </form>
    </div>
  )
}
