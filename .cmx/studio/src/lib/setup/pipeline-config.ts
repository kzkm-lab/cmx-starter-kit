/**
 * デプロイパイプライン設定
 *
 * ローカルでは develop ブランチのみを管理。
 * main / staging の更新はリモート上のマージ PR で行う。
 *
 * フロー:
 *   1. ローカル feature branch → develop へ PR（またはマージ）
 *   2. develop をリモートにプッシュ
 *   3. リモートで develop → main（または staging → main）の PR を作成
 *
 * ローカルから main / staging を直接変更することは禁止。
 */

// ============================================================
// 型定義
// ============================================================

export interface EnvironmentConfig {
  /** 表示名 */
  name: string
  /** 対応する git ブランチ名 */
  branch: string
}

/** タスク完了時のワークフロー */
export type WorkflowMode = "direct" | "pr"

export interface PipelineConfig {
  /** PR のターゲットブランチ（常に develop） */
  targetBranch: string
  /** ローカルで管理する環境一覧 */
  environments: EnvironmentConfig[]
  /** タスク完了時のワークフロー: direct=直接マージ, pr=PR作成 */
  workflowMode: WorkflowMode
}

// ============================================================
// 設定取得
// ============================================================

/**
 * パイプライン設定を返す
 * ローカルでは develop のみ管理。main / staging はリモート専用。
 */
export function getPipelineConfig(): PipelineConfig {
  return {
    targetBranch: "develop",
    environments: [
      { name: "開発", branch: "develop" },
    ],
    workflowMode: "direct",
  }
}
