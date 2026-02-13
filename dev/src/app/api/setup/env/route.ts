import { NextResponse } from "next/server"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const SITE_DIR = join(process.cwd(), "..", "site")
const ENV_FILE = join(SITE_DIR, ".env")

type EnvVars = {
  CMX_API_KEY?: string
  CMX_API_URL?: string
  CMX_WORKSPACE_ID?: string
  NEXT_PUBLIC_SITE_URL?: string
}

/**
 * .env ファイルをパースして環境変数オブジェクトを返す
 */
function parseEnvFile(content: string): EnvVars {
  const lines = content.split("\n")
  const env: EnvVars = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const [key, ...valueParts] = trimmed.split("=")
    const value = valueParts.join("=").trim()

    if (key && value) {
      env[key as keyof EnvVars] = value
    }
  }

  return env
}

/**
 * 環境変数オブジェクトを .env ファイル形式の文字列に変換
 */
function stringifyEnvFile(env: EnvVars, template: string): string {
  const lines = template.split("\n")
  const result: string[] = []

  const updatedKeys = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()

    // コメント行や空行はそのまま保持
    if (!trimmed || trimmed.startsWith("#")) {
      result.push(line)
      continue
    }

    const [key] = trimmed.split("=")
    if (key && key in env) {
      const value = env[key as keyof EnvVars]
      result.push(`${key}=${value}`)
      updatedKeys.add(key)
    } else {
      result.push(line)
    }
  }

  // テンプレートに存在しない新しいキーを追加
  for (const [key, value] of Object.entries(env)) {
    if (!updatedKeys.has(key) && value) {
      result.push(`${key}=${value}`)
    }
  }

  return result.join("\n")
}

/**
 * GET /api/setup/env
 * 現在の環境変数を取得
 */
export async function GET() {
  try {
    if (!existsSync(ENV_FILE)) {
      return NextResponse.json({
        exists: false,
        env: {},
      })
    }

    const content = readFileSync(ENV_FILE, "utf-8")
    const env = parseEnvFile(content)

    return NextResponse.json({
      exists: true,
      env,
    })
  } catch (error) {
    console.error("Failed to read .env file:", error)
    return NextResponse.json(
      { error: "環境変数ファイルの読み込みに失敗しました" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/setup/env
 * 環境変数を保存
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { env } = body as { env: EnvVars }

    // .env または .env.example をテンプレートとして使用
    let template = ""
    if (existsSync(ENV_FILE)) {
      template = readFileSync(ENV_FILE, "utf-8")
    } else {
      const exampleFile = join(SITE_DIR, ".env.example")
      if (existsSync(exampleFile)) {
        template = readFileSync(exampleFile, "utf-8")
      } else {
        // テンプレートが存在しない場合、デフォルトのテンプレートを使用
        template = `# CMX API Configuration
# Get your API key from CMX Admin: https://your-admin.example.com/settings/api-keys
CMX_API_KEY=your_api_key_here
CMX_API_URL=https://your-cmx-admin.example.com

# Optional: Workspace ID (auto-detected from API key if not provided)
# CMX_WORKSPACE_ID=your_workspace_id

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:4000
`
      }
    }

    const content = stringifyEnvFile(env, template)
    writeFileSync(ENV_FILE, content, "utf-8")

    return NextResponse.json({
      success: true,
      message: "環境変数を保存しました",
    })
  } catch (error) {
    console.error("Failed to write .env file:", error)
    return NextResponse.json(
      { error: "環境変数ファイルの書き込みに失敗しました" },
      { status: 500 }
    )
  }
}
