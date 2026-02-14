import { execFileSync } from "child_process"
import { getSiteDirPath } from "./setup-state"
import { getPipelineConfig, type EnvironmentConfig } from "./pipeline-config"

// ============================================================
// 型定義
// ============================================================

export interface ChangedFile {
  /** M, A, D, R 等 */
  status: string
  /** ファイルパス */
  path: string
}

export interface EnvironmentStatus extends EnvironmentConfig {
  /** 最新コミットのハッシュ（短縮） */
  commitHash: string | null
  /** 最新コミットメッセージ */
  commitMessage: string | null
  /** 最新コミット日時 */
  commitDate: string | null
  /** ブランチが存在するか */
  exists: boolean
}

export interface GitStatus {
  /** 現在のブランチ名 */
  currentBranch: string
  /** PR ターゲットブランチ */
  targetBranch: string
  /** 変更されたファイル一覧 */
  changedFiles: ChangedFile[]
  /** 未コミットの変更があるか */
  hasUncommittedChanges: boolean
  /** target に対する ahead/behind */
  commitsAhead: number
  commitsBehind: number
  /** 環境ステータス */
  environments: EnvironmentStatus[]
  /** タスク完了時のワークフロー */
  workflowMode: "direct" | "pr"
  /** develop または develop 派生ブランチかどうか */
  isDevelopOrDerived: boolean
  /** エラーメッセージ */
  error?: string
}

// ============================================================
// Git コマンド実行ヘルパー（execFileSync でインジェクション対策）
// ============================================================

function runGit(args: string[], cwd: string): string {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf-8",
      timeout: 10000,
    }).trim()
  } catch {
    return ""
  }
}

/** runGit のエラーを投げるバージョン（成功必須のコマンド用） */
function runGitStrict(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf-8",
    timeout: 10000,
  }).trim()
}

// ============================================================
// Git 情報取得
// ============================================================

function getCurrentBranch(cwd: string): string {
  return runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd) || "unknown"
}

function getChangedFiles(cwd: string): ChangedFile[] {
  const statusOutput = runGit(["status", "--porcelain"], cwd)
  if (!statusOutput) return []

  return statusOutput.split("\n").filter(Boolean).map((line) => ({
    status: line.substring(0, 2).trim() || "?",
    path: line.substring(3),
  }))
}

function getAheadBehind(cwd: string, branch: string, target: string): { ahead: number; behind: number } {
  const targetExists = runGit(["rev-parse", "--verify", target], cwd)
  if (!targetExists) return { ahead: 0, behind: 0 }

  const result = runGit(["rev-list", "--left-right", "--count", `${branch}...${target}`], cwd)
  if (!result) return { ahead: 0, behind: 0 }

  const [ahead, behind] = result.split("\t").map(Number)
  return { ahead: ahead || 0, behind: behind || 0 }
}

function getEnvironmentStatus(cwd: string, env: EnvironmentConfig): EnvironmentStatus {
  const exists = !!runGit(["rev-parse", "--verify", env.branch], cwd)

  if (!exists) {
    return { ...env, commitHash: null, commitMessage: null, commitDate: null, exists: false }
  }

  const commitHash = runGit(["log", "-1", "--format=%h", env.branch], cwd) || null
  const commitMessage = runGit(["log", "-1", "--format=%s", env.branch], cwd) || null
  const commitDate = runGit(["log", "-1", "--format=%ar", env.branch], cwd) || null

  return { ...env, commitHash, commitMessage, commitDate, exists: true }
}

// ============================================================
// メイン関数
// ============================================================

export function getGitStatus(): GitStatus {
  const siteDir = getSiteDirPath()
  const pipeline = getPipelineConfig()

  try {
    const currentBranch = getCurrentBranch(siteDir)
    const changedFiles = getChangedFiles(siteDir)
    const { ahead, behind } = getAheadBehind(siteDir, currentBranch, pipeline.targetBranch)
    const environments = pipeline.environments.map((env) =>
      getEnvironmentStatus(siteDir, env)
    )

    // develop または develop 派生ブランチ（cmx/task-* など）かどうかを判定
    const isDevelopOrDerived =
      currentBranch === pipeline.targetBranch ||
      currentBranch.startsWith("cmx/task-")

    return {
      currentBranch,
      targetBranch: pipeline.targetBranch,
      changedFiles,
      hasUncommittedChanges: changedFiles.length > 0,
      commitsAhead: ahead,
      commitsBehind: behind,
      environments,
      workflowMode: pipeline.workflowMode,
      isDevelopOrDerived,
    }
  } catch (error) {
    return {
      currentBranch: "unknown",
      targetBranch: pipeline.targetBranch,
      changedFiles: [],
      hasUncommittedChanges: false,
      commitsAhead: 0,
      commitsBehind: 0,
      environments: [],
      workflowMode: pipeline.workflowMode,
      isDevelopOrDerived: false,
      error: error instanceof Error ? error.message : "Git情報の取得に失敗しました",
    }
  }
}

// ============================================================
// Git アクション
// ============================================================

/**
 * ブランチを作成して切り替え（必ず develop から分岐）
 * develop が存在しない場合は main から develop を作成する
 */
export function createBranch(branchName: string): { success: boolean; error?: string } {
  const siteDir = getSiteDirPath()
  const pipeline = getPipelineConfig()

  // ローカルブランチのみをチェック（リモートブランチの復活を防ぐ）
  const exists = !!runGit(["rev-parse", "--verify", `refs/heads/${branchName}`], siteDir)
  if (exists) {
    try {
      runGitStrict(["checkout", branchName], siteDir)
    } catch {
      // 既にそのブランチにいる場合
    }
    return { success: true }
  }

  try {
    // develop ブランチ自体の作成の場合は main から作成
    if (branchName === pipeline.targetBranch) {
      runGitStrict(["checkout", "main"], siteDir)
      runGitStrict(["checkout", "-b", branchName], siteDir)
    } else {
      // タスクブランチなどは必ず develop を起点にする
      runGitStrict(["checkout", pipeline.targetBranch], siteDir)
      runGitStrict(["checkout", "-b", branchName], siteDir)
    }
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ブランチの作成に失敗しました",
    }
  }
}

/**
 * git diff の概要を取得（変更ファイルの統計情報）
 */
export function getGitDiffSummary(): string {
  const siteDir = getSiteDirPath()
  const pipeline = getPipelineConfig()

  const diffStat = runGit(["diff", "--stat", `${pipeline.targetBranch}...HEAD`], siteDir)
  if (diffStat) return diffStat

  return runGit(["diff", "--stat"], siteDir) || "変更なし"
}

// ============================================================
// タスク管理（チェックポイント・ブランチ切替）
// ============================================================

/** タスク用のブランチ名を生成 */
export function getTaskBranchName(taskId: string): string {
  return `cmx/task-${taskId}`
}

/**
 * 現在のブランチの変更を自動チェックポイントコミット
 * 変更がなければ何もしない
 */
export function checkpoint(taskId: string): { committed: boolean; hash: string | null } {
  const cwd = getSiteDirPath()

  // 危険ファイルを除外してステージ
  runGit(
    ["add", "-A", "--", ".", ":(exclude).env", ":(exclude).env.*", ":(exclude)**/*.pem", ":(exclude)**/*.key"],
    cwd
  )

  // ステージに差分があるか確認
  try {
    runGitStrict(["diff", "--cached", "--quiet"], cwd)
    // exit 0 = 差分なし
    return { committed: false, hash: null }
  } catch {
    // exit 1 = 差分あり → コミット
  }

  try {
    runGitStrict(
      ["commit", "--no-verify", "-m", `chore(cmx): checkpoint task:${taskId}`],
      cwd
    )
    const hash = runGit(["rev-parse", "--short", "HEAD"], cwd)
    return { committed: true, hash }
  } catch (error) {
    // user.name/email 未設定等
    return { committed: false, hash: null }
  }
}

/**
 * タスク切り替え: 現在のブランチをチェックポイントし、指定ブランチに切り替え
 */
export function switchTask(params: {
  fromTaskId: string
  toTaskId: string
  toBranch: string | null
}): { success: boolean; checkpointHash: string | null; error?: string } {
  const cwd = getSiteDirPath()
  const pipeline = getPipelineConfig()

  try {
    // 1) 現在のブランチの変更をチェックポイント
    const { hash } = checkpoint(params.fromTaskId)

    // 2) 切り替え先ブランチを決定
    const targetBranch = params.toBranch || pipeline.targetBranch

    // 3) ブランチが存在するか確認、なければ develop から作成
    const branchExists = !!runGit(["rev-parse", "--verify", targetBranch], cwd)
    if (!branchExists) {
      // develop に一旦切り替えてから新ブランチを作成
      runGitStrict(["checkout", pipeline.targetBranch], cwd)
      runGitStrict(["checkout", "-b", targetBranch], cwd)
    } else {
      runGitStrict(["checkout", targetBranch], cwd)
    }

    return { success: true, checkpointHash: hash }
  } catch (error) {
    return {
      success: false,
      checkpointHash: null,
      error: error instanceof Error ? error.message : "タスク切り替えに失敗しました",
    }
  }
}

/**
 * タスクの変更を develop に反映（直接マージモード）
 * checkpoint コミットを squash して 1 コミットにまとめる
 */
export function applyTaskDirect(params: {
  taskId: string
  branchName: string
  summary: string
}): { success: boolean; error?: string } {
  const cwd = getSiteDirPath()
  const pipeline = getPipelineConfig()

  try {
    // 1) 未コミットの変更をチェックポイント
    checkpoint(params.taskId)

    // 2) develop に切り替え
    runGitStrict(["checkout", pipeline.targetBranch], cwd)

    // 3) squash マージ
    runGitStrict(["merge", "--squash", params.branchName], cwd)

    // 4) コミット（squash の結果）
    const message = params.summary || `feat: task ${params.taskId}`
    runGitStrict(["commit", "-m", message], cwd)

    // 5) タスクブランチを削除
    runGit(["branch", "-D", params.branchName], cwd)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "マージに失敗しました",
    }
  }
}

/**
 * タスクのブランチをリモートにプッシュ（PR モード）
 */
export function pushTaskBranch(params: {
  taskId: string
  branchName: string
}): { success: boolean; error?: string } {
  const cwd = getSiteDirPath()

  try {
    // 未コミットの変更をチェックポイント
    checkpoint(params.taskId)

    // プッシュ
    runGitStrict(["push", "-u", "origin", params.branchName], cwd)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "プッシュに失敗しました",
    }
  }
}

/**
 * develop ブランチに切り替える
 * 未コミットの変更がある場合は自動でチェックポイント
 */
export function switchToDevelop(taskId?: string): { success: boolean; error?: string } {
  const cwd = getSiteDirPath()
  const pipeline = getPipelineConfig()

  try {
    // 未コミットの変更があればチェックポイント
    if (taskId) {
      checkpoint(taskId)
    }

    // develop に切り替え
    runGitStrict(["checkout", pipeline.targetBranch], cwd)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "develop への切り替えに失敗しました",
    }
  }
}

/**
 * 現在のブランチに develop の最新を取り込む（rebase）
 * タスクブランチで作業中に develop の更新を取り込みたい場合に使用
 */
export function syncFromDevelop(taskId: string): { success: boolean; error?: string } {
  const cwd = getSiteDirPath()
  const pipeline = getPipelineConfig()

  try {
    // 未コミットの変更をチェックポイント
    checkpoint(taskId)

    // develop の最新を rebase
    runGitStrict(["rebase", pipeline.targetBranch], cwd)

    return { success: true }
  } catch (error) {
    // rebase が競合した場合
    runGit(["rebase", "--abort"], cwd)
    return {
      success: false,
      error: error instanceof Error ? error.message : "develop との同期に失敗しました（競合の可能性）",
    }
  }
}
