"use client"

import { useEffect, useRef, useState, forwardRef } from "react"

interface PreviewFrameProps {
  initialUrl?: string
  onUrlChange?: (url: string) => void
}

/**
 * サイトプレビュー用 iframe コンポーネント
 */
export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame({ initialUrl = "http://localhost:4000", onUrlChange }, ref) {
    const internalRef = useRef<HTMLIFrameElement>(null)
    const iframeRef = (ref as React.RefObject<HTMLIFrameElement>) || internalRef
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [onUrlChange])

    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
              <p className="mt-4 text-sm text-gray-600">サイトを読み込み中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="mt-2 text-sm text-gray-600">
                localhost:4000 でサーバーが起動していることを確認してください
              </p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={initialUrl}
          className="w-full h-full border-0"
          title="Site Preview"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    )
  }
)
