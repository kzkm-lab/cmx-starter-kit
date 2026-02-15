"use client"

import { useEffect, useRef, useState, forwardRef } from "react"

export type ViewportSize = "mobile" | "tablet" | "desktop"

interface PreviewFrameProps {
  initialUrl?: string
  onUrlChange?: (url: string) => void
  viewportSize?: ViewportSize
}

/**
 * サイトプレビュー用 iframe コンポーネント
 */
export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame({ initialUrl = "http://localhost:4000", onUrlChange, viewportSize = "desktop" }, ref) {
    const internalRef = useRef<HTMLIFrameElement>(null)
    const iframeRef = (ref as React.RefObject<HTMLIFrameElement>) || internalRef
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ブレイクポイントのサイズ定義
  const viewportSizes = {
    mobile: { width: 375, height: 667, label: "iPhone SE" }, // iPhone SE
    tablet: { width: 768, height: 1024, label: "iPad" }, // iPad
    desktop: { width: "100%", height: "100%", label: "Desktop" },
  }

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIsLoading(false)
      setError(null)

      // iframe の URL を取得して親に通知
      try {
        const iframeUrl = iframe.contentWindow?.location.href
        if (iframeUrl && onUrlChange) {
          onUrlChange(iframeUrl)
        }
      } catch (e) {
        // クロスオリジンの場合はアクセスできない
        console.warn("Cannot access iframe URL (cross-origin)")
      }
    }

    const handleError = () => {
      setIsLoading(false)
      setError("サイトの読み込みに失敗しました")
    }

    iframe.addEventListener("load", handleLoad)
    iframe.addEventListener("error", handleError)

    return () => {
      iframe.removeEventListener("load", handleLoad)
      iframe.removeEventListener("error", handleError)
    }
  }, [onUrlChange, iframeRef])

  const currentSize = viewportSizes[viewportSize]
  const isResponsive = viewportSize !== "desktop"

    return (
      <div className={`relative w-full h-full ${isResponsive ? "bg-slate-100" : "bg-white"}`}>
        {/* レスポンシブモードの場合、中央に配置 */}
        <div className={`${isResponsive ? "flex items-center justify-center w-full h-full p-8" : "w-full h-full"}`}>
          <div
            className={`relative ${isResponsive ? "bg-white shadow-2xl" : ""}`}
            style={
              isResponsive
                ? {
                    width: `${currentSize.width}px`,
                    height: `${currentSize.height}px`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }
                : { width: "100%", height: "100%" }
            }
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-all duration-300">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">Loading Preview...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <div className="h-4 w-4 text-red-500 rounded-sm border-2 border-current" />
                  </div>
                  <h3 className="text-slate-900 font-semibold mb-2">Preview Unavailable</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {error}
                  </p>
                  <p className="text-xs text-slate-400">
                    Ensure the development server is running at localhost:4000
                  </p>
                </div>
              </div>
            )}

            {/* iframe の直接の親として白い背景を設定 */}
            <div className="w-full h-full bg-white">
              <iframe
                ref={iframeRef}
                src={initialUrl}
                className="w-full h-full border-0"
                title="Site Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
)
