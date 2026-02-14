"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  GitMerge,
  GitPullRequest,
  FileEdit,
  FilePlus,
  FileX,
  ArrowRight,
  RefreshCw,
  Upload,
  Eye,
  Circle,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GitStatus } from "@/lib/setup/git-service"
import type { TaskStatus } from "@/lib/setup/session-file"

interface DeployPanelProps {
  /** チャットにメッセージを送信する関数 */
  onSendMessage: (message: string) => void
  /** チャットがローディング中か */
  isLoading: boolean
  /** 現在のタスクのブランチ名 */
  currentTaskBranch: string | null
  /** タスクのステータス */
  taskStatus: TaskStatus
  /** タスク完了ハンドラ */
  onApplyTask: () => void
  /** PR 用プッシュハンドラ */
  onPushTask: () => void
  /** develop から同期ハンドラ */
  onSyncFromDevelop?: () => void
  /** develop から同期中フラグ */
  isSyncingFromDevelop?: boolean
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

export function DeployPanel({
  onSendMessage,
  isLoading,
  currentTaskBranch,
  taskStatus,
  onApplyTask,
  onPushTask,
  onSyncFromDevelop,
  isSyncingFromDevelop = false,
}: DeployPanelProps) {
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

  const { currentBranch, targetBranch, changedFiles, commitsAhead, environments, workflowMode } = gitStatus

  // develop ブランチが存在するか
  const targetEnv = environments.find((e) => e.branch === targetBranch)
  const targetExists = targetEnv?.exists ?? false
  const isOnDevelop = currentBranch === targetBranch
  const isOnTaskBranch = currentTaskBranch !== null && currentBranch === currentTaskBranch
  const hasChanges = changedFiles.length > 0 || commitsAhead > 0

  // 「変更を確認」ボタンのハンドラ
  const handleViewChanges = () => {
    onSendMessage(
      `現在の変更内容を確認してください。git diff で変更の概要を教えてください。`
    )
  }

  // 「リモートにプッシュ」ボタンのハンドラ（develop ブランチ上）
  const handlePushToRemote = () => {
    onSendMessage(
      `develop ブランチをリモートリポジトリにプッシュしてください。リモートが設定されていない場合は設定方法を教えてください。`
    )
  }

  // 「開発ブランチを作成」ハンドラ（API 直接呼び出し）
  const handleCreateDevelop = async () => {
    try {
      const response = await fetch("/api/setup/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-branch", branchName: targetBranch }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchStatus()
      } else {
        console.error("Failed to create branch:", data.error)
      }
    } catch (error) {
      console.error("Failed to create branch:", error)
    }
  }

  return (
    <div className="bg-white overflow-hidden">
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
        <div className="flex items-center gap-1 ml-auto">
          <Circle
            className={`w-2.5 h-2.5 ${
              targetExists ? "text-green-500 fill-green-500" : "text-slate-300 fill-slate-300"
            }`}
          />
          <span className="text-[10px] text-slate-500 font-mono">{currentBranch}</span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-3 py-2 space-y-3">
          {/* ブランチ情報 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium text-slate-700">{currentBranch}</span>
              {/* タスクブランチ上のときだけマージ先を表示 */}
              {isOnTaskBranch && (
                <>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span className="font-mono text-slate-500">{targetBranch}</span>
                </>
              )}
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
                  {commitsAhead} commit{commitsAhead > 1 ? "s" : ""} ahead
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

          {/* アクションボタン */}
          {!targetExists ? (
            /* develop ブランチが未作成 */
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
          ) : isOnTaskBranch ? (
            /* タスクブランチ上: 反映 or PR */
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-1">
                {onSyncFromDevelop && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1"
                    onClick={onSyncFromDevelop}
                    disabled={isLoading || isSyncingFromDevelop}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingFromDevelop ? "animate-spin" : ""}`} />
                    {isSyncingFromDevelop ? "同期中..." : "developと同期"}
                  </Button>
                )}
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
                {workflowMode === "direct" ? (
                  <Button
                    size="sm"
                    className="h-7 text-[11px] gap-1"
                    onClick={onApplyTask}
                    disabled={isLoading || !hasChanges}
                  >
                    <Check className="w-3 h-3" />
                    反映する
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-7 text-[11px] gap-1"
                    onClick={onPushTask}
                    disabled={isLoading || !hasChanges}
                  >
                    <GitPullRequest className="w-3 h-3" />
                    レビューに出す
                  </Button>
                )}
              </div>
              {taskStatus === "done" && (
                <p className="text-[10px] text-green-600">
                  このタスクの変更は反映済みです
                </p>
              )}
            </div>
          ) : isOnDevelop ? (
            /* develop ブランチ上: プッシュで反映 */
            <div className="space-y-2">
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
                  onClick={handlePushToRemote}
                  disabled={isLoading || !hasChanges}
                >
                  <Upload className="w-3 h-3" />
                  プッシュ
                </Button>
              </div>
              <p className="text-[10px] text-slate-400">
                main への反映はリモートで PR を作成してください
              </p>
            </div>
          ) : (
            /* その他のブランチ上（main 等）→ develop に戻す */
            <div className="space-y-2">
              <p className="text-[10px] text-amber-600">
                作業は {targetBranch} ブランチ上で行います。{targetBranch} に切り替えてください。
              </p>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={() => {
                  onSendMessage(
                    `${targetBranch} ブランチにチェックアウトしてください。`
                  )
                }}
                disabled={isLoading}
              >
                <GitBranch className="w-3 h-3" />
                {targetBranch} に切り替え
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
