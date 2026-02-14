import { execSync } from "child_process"
import { getSiteDirPath } from "./setup-state"
import { getPipelineConfig, type PipelineConfig, type EnvironmentConfig } from "./pipeline-config"

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
  /** パイプラインモード */
  pipelineMode: string
  /** エラーメッセージ */
  error?: string
}

// ============================================================
// Git コマンド実行ヘルパー
// ============================================================

function git(args: string, cwd: string): string {
  try {
    return execSync(`git ${args}`, {
      cwd,
      encoding: "utf-8",
      timeout: 10000,
    }).trim()
  } catch {
    return ""
  }
}

// ============================================================
// Git 情報取得
// ============================================================

function getCurrentBranch(cwd: string): string {
  return git("rev-parse --abbrev-ref HEAD", cwd) || "unknown"
}

function getChangedFiles(cwd: string): ChangedFile[] {
  // staged + unstaged + untracked
  const statusOutput = git("status --porcelain", cwd)
  if (!statusOutput) return []

  return statusOutput.split("\n").filter(Boolean).map((line) => ({
    status: line.substring(0, 2).trim() || "?",
    path: line.substring(3),
  }))
}

function getAheadBehind(cwd: string, branch: string, target: string): { ahead: number; behind: number } {
  // ターゲットブランチが存在するか確認
  const targetExists = git(`rev-parse --verify ${target}`, cwd)
  if (!targetExists) return { ahead: 0, behind: 0 }

  const result = git(`rev-list --left-right --count ${branch}...${target}`, cwd)
  if (!result) return { ahead: 0, behind: 0 }

  const [ahead, behind] = result.split("\t").map(Number)
  return { ahead: ahead || 0, behind: behind || 0 }
}

function getEnvironmentStatus(cwd: string, env: EnvironmentConfig): EnvironmentStatus {
  // ブランチが存在するか確認
  const exists = !!git(`rev-parse --verify ${env.branch}`, cwd)

  if (!exists) {
    return { ...env, commitHash: null, commitMessage: null, commitDate: null, exists: false }
  }

  const commitHash = git(`log -1 --format=%h ${env.branch}`, cwd) || null
  const commitMessage = git(`log -1 --format=%s ${env.branch}`, cwd) || null
  const commitDate = git(`log -1 --format=%ar ${env.branch}`, cwd) || null

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

    return {
      currentBranch,
      targetBranch: pipeline.targetBranch,
      changedFiles,
      hasUncommittedChanges: changedFiles.length > 0,
      commitsAhead: ahead,
      commitsBehind: behind,
      environments,
      pipelineMode: pipeline.mode,
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
      pipelineMode: pipeline.mode,
      error: error instanceof Error ? error.message : "Git情報の取得に失敗しました",
    }
  }
}

// ============================================================
// Git アクション
// ============================================================

/**
 * ブランチを作成（現在のブランチから分岐）
 */
export function createBranch(branchName: string): { success: boolean; error?: string } {
  const siteDir = getSiteDirPath()

  // 既に存在するか確認
  const exists = !!git(`rev-parse --verify ${branchName}`, siteDir)
  if (exists) {
    return { success: true } // 既に存在するなら成功扱い
  }

  try {
    execSync(`git branch ${branchName}`, {
      cwd: siteDir,
      encoding: "utf-8",
      timeout: 10000,
    })
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

  // target ブランチとの diff stat
  const diffStat = git(`diff --stat ${pipeline.targetBranch}...HEAD`, siteDir)
  if (diffStat) return diffStat

  // target がない場合は working tree の diff
  return git("diff --stat", siteDir) || "変更なし"
}
