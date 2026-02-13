import { NextResponse } from "next/server"

interface ErrorResponseOptions {
  status?: number
  code?: string
  details?: Record<string, string>
}

/**
 * 成功レスポンス
 */
export function jsonResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * エラーレスポンス（統一形式）
 */
export function errorResponse(
  error: string,
  options: ErrorResponseOptions = {}
): NextResponse {
  const { status = 400, code, details } = options

  return NextResponse.json(
    {
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * 401 Unauthorized
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return errorResponse(message, {
    status: 401,
    code: "AUTH_REQUIRED",
  })
}

/**
 * 403 Forbidden
 */
export function forbiddenResponse(message = "権限がありません"): NextResponse {
  return errorResponse(message, {
    status: 403,
    code: "INSUFFICIENT_PERMISSION",
  })
}

/**
 * 404 Not Found
 */
export function notFoundResponse(resource = "リソース"): NextResponse {
  return errorResponse(`${resource}が見つかりません`, {
    status: 404,
    code: "NOT_FOUND",
  })
}

/**
 * 400 Validation Error
 */
export function validationErrorResponse(
  message: string,
  details?: Record<string, string>
): NextResponse {
  return errorResponse(message, {
    status: 400,
    code: "VALIDATION_ERROR",
    details,
  })
}

/**
 * 500 Internal Error
 */
export function internalErrorResponse(message = "内部エラーが発生しました"): NextResponse {
  return errorResponse(message, {
    status: 500,
    code: "INTERNAL_ERROR",
  })
}

/**
 * 409 Conflict (Duplicate)
 */
export function conflictResponse(message: string): NextResponse {
  return errorResponse(message, {
    status: 409,
    code: "CONFLICT",
  })
}
