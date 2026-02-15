"use client"

import { useEffect } from "react"

/**
 * iframe 内で表示されているかを検出し、body に .in-iframe クラスを追加する
 * backdrop-filter が iframe 内でグレー背景になる問題を回避するため
 */
export function IframeDetector() {
  useEffect(() => {
    const isInIframe = window.self !== window.top

    if (isInIframe) {
      document.body.classList.add("in-iframe")
    } else {
      document.body.classList.remove("in-iframe")
    }

    return () => {
      document.body.classList.remove("in-iframe")
    }
  }, [])

  return null
}
