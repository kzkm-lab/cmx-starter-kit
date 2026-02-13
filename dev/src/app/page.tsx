"use client"

import { useState, useRef } from "react"
import { PreviewFrame } from "./_components/preview-frame"
import { UrlBar } from "./_components/url-bar"
import { ChatInterface } from "./_components/chat-interface"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export default function SetupPage() {
  const [currentUrl, setCurrentUrl] = useState("http://localhost:4000")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // URL バーからのナビゲーション
  const handleNavigate = (url: string) => {
    setCurrentUrl(url)
    // iframe の src を変更する代わりに、直接 location を変更
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

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* URL バー */}
      <UrlBar
        url={currentUrl}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
      />

      {/* リサイズ可能なパネルレイアウト */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* 左側: iframe プレビュー */}
        <ResizablePanel defaultSize={70} minSize={40}>
          <PreviewFrame
            initialUrl={currentUrl}
            onUrlChange={handleUrlChange}
          />
        </ResizablePanel>

        {/* リサイズハンドル */}
        <ResizableHandle withHandle />

        {/* 右側: チャットインターフェース */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full overflow-hidden">
            <ChatInterface />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
