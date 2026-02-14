"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  FileEdit,
  FilePlus,
  FileX,
  ArrowRight,
  RefreshCw,
  Send,
  Eye,
  Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GitStatus, EnvironmentStatus } from "@/lib/setup/git-service"

interface DeployPanelProps {
  /** チャットにメッセージを送信する関数 */
  onSendMessage: (message: string) => void
  /** チャットがローディング中か */
  isLoading: boolean
}

/** ファイルステータスに対応するアイコン */
function FileStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "M":
    case "MM":
      return <FileEdit className="w-3 h-3 text-amber-500" />
    case "A":
    case "??":
      return <FilePlus className="w-3 h-3 text-green-500" />
    case "D":
      return <FileX className="w-3 h-3 text-red-500" />
    default:
      return <FileEdit className="w-3 h-3 text-slate-400" />
  }
}

/** 環境ステータスの丸アイコン */
function EnvDot({ env, isFirst }: { env: EnvironmentStatus; isFirst: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {!isFirst && <ArrowRight className="w-3 h-3 text-slate-300" />}
      <div className="flex items-center gap-1">
        <Circle
          className={`w-2.5 h-2.5 ${
            env.exists ? "text-green-500 fill-green-500" : "text-slate-300 fill-slate-300"
          }`}
        />
        <span className="text-[10px] text-slate-500">{env.name}</span>
      </div>
    </div>
  )
}

export function DeployPanel({ onSendMessage, isLoading }: DeployPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFiles, setShowFiles] = useState(false)

  const fetchStatus = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/setup/git")
      const data = await response.json()
      setGitStatus(data)
    } catch (error) {
      console.error("Failed to fetch git status:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // 初回ロードと定期更新（30秒）
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  if (!gitStatus) return null

  const { currentBranch, targetBranch, changedFiles, commitsAhead, environments } = gitStatus

  // develop ブランチが存在するか
  const targetEnv = environments.find((e) => e.branch === targetBranch)
  const targetExists = targetEnv?.exists ?? false

  // 「開発ブランチを作成」ハンドラ
  const handleCreateDevelop = () => {
    onSendMessage(
      `${targetBranch} ブランチを現在のブランチ (${currentBranch}) から作成してください。git branch ${targetBranch} を実行してください。`
    )
  }

  // 「開発に送る」ボタンのハンドラ
  const handleSendToDevelop = () => {
    onSendMessage(
      `現在の変更内容で ${targetBranch} ブランチへのプルリクエストを作成してください。変更内容を要約してPRのタイトルと説明を付けてください。`
    )
  }

  // 「変更を確認」ボタンのハンドラ
  const handleViewChanges = () => {
    onSendMessage(
      `現在の変更内容を確認してください。git diff で変更の概要を教えてください。`
    )
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>サイトの状態</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {environments.map((env, i) => (
            <EnvDot key={env.branch} env={env} isFirst={i === 0} />
          ))}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-3 py-2 space-y-3">
          {/* ブランチ情報 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium text-slate-700">{currentBranch}</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className="font-mono text-slate-500">{targetBranch}</span>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isRefreshing}
              className="p-1 rounded hover:bg-slate-100 transition-colors"
              title="更新"
            >
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* コミット状況 */}
          {(commitsAhead > 0 || changedFiles.length > 0) && (
            <div className="flex items-center gap-2 text-[10px]">
              {commitsAhead > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                  {commitsAhead} commit ahead
                </span>
              )}
              {changedFiles.length > 0 && (
                <button
                  onClick={() => setShowFiles(!showFiles)}
                  className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors"
                >
                  {changedFiles.length} 件の変更
                </button>
              )}
            </div>
          )}

          {/* 変更ファイル一覧（トグル） */}
          {showFiles && changedFiles.length > 0 && (
            <div className="bg-slate-50 rounded p-2 space-y-0.5 max-h-32 overflow-y-auto">
              {changedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                  <FileStatusIcon status={file.status} />
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
            </div>
          )}

          {/* 環境ステータス */}
          <div className="space-y-1">
            {environments.map((env) => (
              <div key={env.branch} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Circle
                    className={`w-2 h-2 ${
                      env.exists ? "text-green-500 fill-green-500" : "text-slate-300 fill-slate-300"
                    }`}
                  />
                  <span className="font-medium text-slate-600">{env.name}</span>
                  {env.commitHash && (
                    <span className="font-mono text-slate-400">{env.commitHash}</span>
                  )}
                </div>
                {env.commitDate && (
                  <span className="text-slate-400">{env.commitDate}</span>
                )}
              </div>
            ))}
          </div>

          {/* アクションボタン */}
          {!targetExists ? (
            <div className="pt-1 space-y-2">
              <p className="text-[10px] text-amber-600">
                開発ブランチ ({targetBranch}) がありません。作成すると変更管理を開始できます。
              </p>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={handleCreateDevelop}
                disabled={isLoading}
              >
                <GitBranch className="w-3 h-3" />
                開発ブランチを作成
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={handleViewChanges}
                disabled={isLoading}
              >
                <Eye className="w-3 h-3" />
                変更を確認
              </Button>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={handleSendToDevelop}
                disabled={isLoading || (changedFiles.length === 0 && commitsAhead === 0)}
              >
                <Send className="w-3 h-3" />
                開発に送る
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
