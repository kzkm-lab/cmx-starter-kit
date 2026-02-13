"use client"

import { useState, useRef, useEffect } from "react"
import { Minus, Maximize2, Minimize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "./chat-interface"

interface FloatingChatProps {
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
}

/**
 * ドラッグ可能なフローティングチャットボックス
 * - ドラッグ移動
 * - 最小化/最大化
 * - リサイズ
 */
export function FloatingChat({
  initialPosition = { x: 20, y: 80 },
  initialSize = { width: 400, height: 600 },
}: FloatingChatProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const lastPosition = useRef(initialPosition)
  const lastSize = useRef(initialSize)

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  // ドラッグ中
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  // 最小化トグル
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // 最大化トグル
  const toggleMaximize = () => {
    if (isMaximized) {
      // 元のサイズ・位置に戻す
      setPosition(lastPosition.current)
      setSize(lastSize.current)
      setIsMaximized(false)
    } else {
      // 現在の位置・サイズを保存
      lastPosition.current = position
      lastSize.current = size
      // 最大化
      setPosition({ x: 0, y: 60 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 60 })
      setIsMaximized(true)
    }
  }

  const chatStyle = isMaximized
    ? {
        left: 0,
        top: 60,
        width: "100%",
        height: "calc(100vh - 60px)",
      }
    : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? "auto" : size.height,
      }

  return (
    <div
      ref={chatRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border flex flex-col overflow-hidden"
      style={chatStyle}
    >
      {/* ヘッダー（ドラッグハンドル） */}
      <div
        className={`flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white ${
          isMaximized ? "cursor-default" : "cursor-move"
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/80" />
          <h3 className="text-sm font-semibold">CMX Setup Assistant</h3>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={toggleMinimize}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={toggleMaximize}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* チャットコンテンツ */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      )}
    </div>
  )
}
