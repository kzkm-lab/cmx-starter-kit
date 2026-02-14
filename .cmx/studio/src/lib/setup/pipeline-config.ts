/**
 * デプロイパイプライン設定
 *
 * ユーザーのサイト（site/）の git ブランチ運用を抽象化。
 * 「開発 → 本番」または「開発 → 検証 → 本番」のパイプラインを設定可能。
 *
 * dev UI は常にローカル feature branch → develop への PR 作成を担当。
 * develop 以降のプロモート（検証・本番）は CI/CD や手動で行う想定。
 */

// ============================================================
// 型定義
// ============================================================

export type PipelineMode = "direct" | "staging"

export interface EnvironmentConfig {
  /** 表示名 */
  name: string
  /** 対応する git ブランチ名 */
  branch: string
}

export interface PipelineConfig {
  mode: PipelineMode
  /** PR のターゲットブランチ（常に develop） */
  targetBranch: string
  /** 環境一覧（パイプライン順） */
  environments: EnvironmentConfig[]
}

// ============================================================
// パイプライン定義
// ============================================================

const pipelines: Record<PipelineMode, PipelineConfig> = {
  /** 開発 → 本番（検証なし） */
  direct: {
    mode: "direct",
    targetBranch: "develop",
    environments: [
      { name: "開発", branch: "develop" },
      { name: "本番", branch: "main" },
    ],
  },
  /** 開発 → 検証 → 本番 */
  staging: {
    mode: "staging",
    targetBranch: "develop",
    environments: [
      { name: "開発", branch: "develop" },
      { name: "検証", branch: "staging" },
      { name: "本番", branch: "main" },
    ],
  },
}

// ============================================================
// 設定取得
// ============================================================

/**
 * 環境変数からパイプラインモードを取得
 * DEPLOY_PIPELINE=staging で3環境モード（デフォルト: direct）
 */
export function getPipelineConfig(): PipelineConfig {
  const mode = (process.env.DEPLOY_PIPELINE || "direct") as PipelineMode
  return pipelines[mode] || pipelines.direct
}
