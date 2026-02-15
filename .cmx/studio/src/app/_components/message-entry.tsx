"use client"

import { useState } from "react"
import {
  User,
  Bot,
  Terminal,
  FileEdit,
  Eye,
  Search,
  Globe,
  Settings,
  CheckSquare,
  AlertCircle,
  ChevronDown,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"

// ============================================================
// 型定義
// ============================================================

export type MessageRole = "user" | "assistant" | "system" | "tool"

export type ToolStatus = "pending" | "success" | "error" | "completed"

export interface MessageEntry {
  role: MessageRole
  content: string
  toolName?: string
  toolStatus?: ToolStatus
  toolUseId?: string
  thinking?: boolean
  isLast?: boolean
}

// ============================================================
// ヘルパー関数
// ============================================================

const getEntryIcon = (entry: MessageEntry) => {
  const iconSize = "h-3 w-3"

  if (entry.role === "user") {
    return <User className={iconSize} />
  }

  if (entry.role === "assistant") {
    if (entry.thinking) {
      return <Brain className={iconSize} />
    }
    return <Bot className={iconSize} />
  }

  if (entry.role === "system") {
    return <Settings className={iconSize} />
  }

  if (entry.role === "tool") {
    const toolName = entry.toolName?.toLowerCase() || ""

    if (toolName.includes("bash") || toolName.includes("command")) {
      return <Terminal className={iconSize} />
    }
    if (toolName.includes("edit") || toolName.includes("write")) {
      return <FileEdit className={iconSize} />
    }
    if (toolName.includes("read")) {
      return <Eye className={iconSize} />
    }
    if (toolName.includes("grep") || toolName.includes("search") || toolName.includes("glob")) {
      return <Search className={iconSize} />
    }
    if (toolName.includes("web")) {
      return <Globe className={iconSize} />
    }
    if (toolName.includes("todo")) {
      return <CheckSquare className={iconSize} />
    }
    return <Settings className={iconSize} />
  }

  return <Settings className={iconSize} />
}

const getStatusIndicator = (status?: ToolStatus) => {
  if (!status) return null

  const colorMap = {
    pending: "bg-blue-400",
    success: "bg-green-400",
    error: "bg-red-400",
    completed: "bg-green-400",
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full absolute -left-1 top-0.5",
          colorMap[status]
        )}
      />
      {status === "pending" && (
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full absolute -left-1 top-0.5 animate-ping",
            colorMap[status]
          )}
        />
      )}
    </div>
  )
}

// ============================================================
// コンポーネント
// ============================================================

interface MessageEntryProps {
  entry: MessageEntry
  index: number
}

export function MessageEntryComponent({ entry, index }: MessageEntryProps) {
  const [expanded, setExpanded] = useState(false)

  // ツールメッセージの場合
  if (entry.role === "tool") {
    const hasContent = entry.content && entry.content !== entry.toolName
    const canExpand = hasContent && entry.content.length > 100
    const isError = entry.toolStatus === "error"

    // ステータスに応じたドットの色
    const dotColor = entry.toolStatus === "success" || entry.toolStatus === "completed"
      ? "bg-green-500"
      : entry.toolStatus === "error"
      ? "bg-red-400"
      : entry.toolStatus === "pending"
      ? "bg-blue-400"
      : "bg-muted-foreground"

    // ツール名に応じたアイコンを取得
    const toolIcon = getEntryIcon(entry)

    return (
      <div className="flex gap-3 px-4 py-2">
        {/* タイムライン */}
        <div className="relative flex flex-col items-center pt-1">
          <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColor)} />
          {!entry.isLast && <div className="w-px flex-1 bg-border mt-1" />}
        </div>

        <div className="flex-1 min-w-0 pb-1">
          <button
            onClick={() => canExpand && setExpanded(!expanded)}
            className={cn(
              "w-full flex items-center gap-2 text-left text-xs",
              isError ? "text-red-400" : "text-foreground/70",
              canExpand && "hover:text-foreground cursor-pointer"
            )}
          >
            <span className="flex-shrink-0">{toolIcon}</span>
            <span className="font-medium truncate">{entry.toolName || "Tool"}</span>
            {canExpand && (
              <ChevronDown
                className={cn(
                  "h-3 w-3 flex-shrink-0 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            )}
          </button>

          {hasContent && (expanded || !canExpand) && (
            isError ? (
              // エラー結果 - 赤い背景のボックス
              <div className="mt-2 p-3 rounded border bg-red-950/10 border-red-800/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-300">エラー</span>
                </div>
                <div className="text-xs text-red-100 font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {entry.content}
                </div>
              </div>
            ) : (
              // 通常の結果
              <div className="mt-2 text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto border border-border rounded p-2 bg-secondary">
                {entry.content}
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  // エラーメッセージの場合
  if (entry.role === "system") {
    return (
      <div className="flex gap-3 px-4 py-2">
        {/* タイムライン */}
        <div className="relative flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-400" />
          {!entry.isLast && <div className="w-px flex-1 bg-border mt-1" />}
        </div>

        <div className="flex-1 text-xs text-red-400 whitespace-pre-wrap pb-1">
          {entry.content}
        </div>
      </div>
    )
  }

  // ユーザーメッセージの場合（タイムラインなし）
  if (entry.role === "user") {
    return (
      <div className="px-4 py-2">
        <div className="bg-muted border border-input rounded-md px-3 py-2 text-xs">
          <div className="whitespace-pre-wrap break-words font-light text-foreground">
            {entry.content}
          </div>
        </div>
      </div>
    )
  }

  // アシスタントメッセージの場合（タイムラインあり）
  const dotColor = entry.thinking ? "bg-purple-400 dark:bg-purple-500" : "bg-muted-foreground/40"

  return (
    <div className="flex gap-3 px-4 py-2">
      {/* タイムライン */}
      <div className="relative flex flex-col items-center pt-1">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColor)} />
        {!entry.isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>

      <div className="flex-1 pb-1">
        {entry.thinking ? (
          // Thinking メッセージ - 紫色テーマの折りたたみカード
          <details className="group rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-900/15 overflow-hidden">
            <summary className="cursor-pointer px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-800/20 transition-colors min-w-0">
              <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180 flex-shrink-0" />
              <Brain className="w-3 h-3 flex-shrink-0" />
              <span className="flex-shrink-0">Thinking</span>
              {entry.content && (
                <span className="truncate text-purple-400 dark:text-purple-500 font-normal group-open:hidden">
                  {entry.content.replace(/\n/g, " ").slice(0, 60)}
                </span>
              )}
            </summary>
            <div className="px-3 py-2 border-t border-purple-200/50 dark:border-purple-800/50">
              <div className="whitespace-pre-wrap break-words text-xs text-purple-600 dark:text-purple-400 italic leading-relaxed">
                {entry.content}
              </div>
            </div>
          </details>
        ) : (() => {
          // JSON レスポンスの自動検出
          const trimmedContent = entry.content.trim()
          const isJSON =
            (trimmedContent.startsWith("{") || trimmedContent.startsWith("[")) &&
            (trimmedContent.endsWith("}") || trimmedContent.endsWith("]"))

          if (isJSON) {
            try {
              const parsed = JSON.parse(trimmedContent)
              const formatted = JSON.stringify(parsed, null, 2)

              return (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">JSON レスポンス</span>
                  </div>
                  <div className="bg-secondary border border-border rounded-lg overflow-hidden">
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-foreground text-xs font-mono block whitespace-pre">
                        {formatted}
                      </code>
                    </pre>
                  </div>
                </div>
              )
            } catch {
              // JSON パースエラー - 通常のマークダウンとして表示
            }
          }

          // 通常のマークダウンレンダリング
          return (
            <Markdown className="text-xs font-light prose prose-sm max-w-none dark:prose-invert">
              {entry.content}
            </Markdown>
          )
        })()}
      </div>
    </div>
  )
}
