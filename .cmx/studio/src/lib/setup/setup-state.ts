import { existsSync } from "fs"
import { join } from "path"

export type SetupStep =
  | "not_started"
  | "env_configured"
  | "schema_generated"
  | "completed"

export interface SetupStatus {
  step: SetupStep
  hasEnv: boolean
  hasGenerated: boolean
  message: string
}

/**
 * site/ディレクトリを検査してセットアップ状態を判定
 */
export function checkSetupStatus(siteDir: string): SetupStatus {
  const envPath = join(siteDir, ".env")
  const generatedDir = join(siteDir, "cmx", "generated")

  const hasEnv = existsSync(envPath)
  const hasGenerated = existsSync(generatedDir)

  let step: SetupStep = "not_started"
  let message = "セットアップを開始してください"

  if (hasEnv && hasGenerated) {
    step = "completed"
    message = "セットアップ完了！サイトの開発を開始できます"
  } else if (hasEnv) {
    step = "env_configured"
    message = "環境設定完了。次はスキーマを設計してください"
  } else if (hasGenerated) {
    step = "schema_generated"
    message = "スキーマ生成完了。環境変数を設定してください"
  }

  return {
    step,
    hasEnv,
    hasGenerated,
    message,
  }
}

/**
 * サイトルートディレクトリのパスを取得
 */
export function getSiteDirPath(): string {
  // .cmx/studio/ から見て ../../ がプロジェクトルート
  return join(process.cwd(), "..", "..")
}
