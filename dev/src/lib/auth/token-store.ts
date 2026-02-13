import { mkdir, readFile, writeFile, unlink } from "fs/promises"
import { homedir } from "os"
import { join } from "path"

/**
 * トークンストレージ
 * ~/.cmx/credentials.json にトークンを保存
 */

export interface Credentials {
  accessToken: string
  refreshToken?: string
  expiresAt?: string // ISO 8601 format
}

/**
 * 認証情報の保存先ディレクトリ
 */
function getCredentialsDir(): string {
  return join(homedir(), ".cmx")
}

/**
 * 認証情報の保存先パス
 */
function getCredentialsPath(): string {
  return join(getCredentialsDir(), "credentials.json")
}

/**
 * 認証情報を保存
 */
export async function saveCredentials(credentials: Credentials): Promise<void> {
  const dir = getCredentialsDir()
  const path = getCredentialsPath()

  // ディレクトリが存在しない場合は作成
  await mkdir(dir, { recursive: true })

  // JSON形式で保存
  await writeFile(path, JSON.stringify(credentials, null, 2), "utf-8")
}

/**
 * 認証情報を取得
 */
export async function loadCredentials(): Promise<Credentials | null> {
  const path = getCredentialsPath()

  try {
    const content = await readFile(path, "utf-8")
    return JSON.parse(content) as Credentials
  } catch (error) {
    // ファイルが存在しない場合はnullを返す
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null
    }
    throw error
  }
}

/**
 * 認証情報を削除
 */
export async function clearCredentials(): Promise<void> {
  const path = getCredentialsPath()

  try {
    await unlink(path)
  } catch (error) {
    // ファイルが存在しない場合は無視
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error
    }
  }
}

/**
 * トークンの有効期限をチェック
 */
export function isTokenExpired(credentials: Credentials): boolean {
  if (!credentials.expiresAt) {
    return false // 有効期限が設定されていない場合は有効とみなす
  }

  const expiresAt = new Date(credentials.expiresAt).getTime()
  const now = Date.now()

  // 5分のバッファを持たせる
  return expiresAt - now < 5 * 60 * 1000
}
