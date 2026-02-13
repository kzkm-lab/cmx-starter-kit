"use client"

import { useState, useRef } from "react"
import { PreviewFrame } from "./_components/preview-frame"
import { UrlBar } from "./_components/url-bar"
import { ChatInterface } from "./_components/chat-interface"
import { AuthStatus } from "./_components/auth-status"
import { ExternalLink, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

const DEFAULT_SITE_URL = "http://localhost:4000"
const ADMIN_URL = "https://stg.cmx-ai.org"

export default function SetupPage() {
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_SITE_URL)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // URL バーからのナビゲーション
  const handleNavigate = (url: string) => {
    setCurrentUrl(url)
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.location.href = url
      } catch (e) {
        // クロスオリジンの場合は src を変更
        if (iframeRef.current) {
          iframeRef.current.src = url
        }
      }
    }
  }

  // iframe からの URL 変更通知
  const handleUrlChange = (url: string) => {
    setCurrentUrl(url)
  }

  // ブラウザ操作（戻る・進む）
  const handleBack = () => {
    iframeRef.current?.contentWindow?.history.back()
  }

  const handleForward = () => {
    iframeRef.current?.contentWindow?.history.forward()
  }

  const handleRefresh = () => {
    iframeRef.current?.contentWindow?.location.reload()
  }

  const handleHome = () => {
    handleNavigate(DEFAULT_SITE_URL)
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* 一番上のヘッダー（全体） */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
        <h1 className="text-sm font-semibold text-slate-900">CMX Starter Kit - Development Console</h1>
        <div className="flex items-center gap-2">
          <AuthStatus />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => window.open(ADMIN_URL, "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Admin を開く
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* リサイズ可能なパネルレイアウト */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* 左側: URL バー + iframe プレビュー */}
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-full flex flex-col">
            {/* URL バー */}
            <UrlBar
              url={currentUrl}
              onNavigate={handleNavigate}
              onBack={handleBack}
              onForward={handleForward}
              onRefresh={handleRefresh}
              onHome={handleHome}
            />
            {/* iframe プレビュー */}
            <div className="flex-1">
              <PreviewFrame
                initialUrl={currentUrl}
                onUrlChange={handleUrlChange}
              />
            </div>
          </div>
        </ResizablePanel>

        {/* リサイズハンドル */}
        <ResizableHandle withHandle className="w-1 bg-slate-900 hover:bg-slate-700" />

        {/* 右側: チャットインターフェース */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <ChatInterface
            settingsOpen={settingsOpen}
            onSettingsOpenChange={setSettingsOpen}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
