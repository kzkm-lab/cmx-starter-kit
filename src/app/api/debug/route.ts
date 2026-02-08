/**
 * Debug endpoint to test Admin API connection
 * TEMPORARY - Remove after debugging
 */

import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.CMX_API_URL
  const token = process.env.CMX_API_KEY

  if (!baseUrl) {
    return NextResponse.json({
      error: "CMX_API_URL environment variable is not set"
    }, { status: 500 })
  }

  const url = `${baseUrl}/api/v1/public/collections/news/posts`

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      CMX_API_URL: baseUrl,
      CMX_API_KEY: token ? "***set***" : "(not set)",
      targetUrl: url,
    },
  }

  try {
    // Direct fetch without Next.js options
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    results.response = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    }

    // Try to get body
    const text = await response.text()
    results.responseBody = text.substring(0, 1000) // Limit size

    // Try to parse as JSON
    try {
      results.parsedJson = JSON.parse(text)
    } catch {
      results.jsonParseError = "Failed to parse response as JSON"
    }
  } catch (error) {
    results.fetchError = {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined,
    }
  }

  return NextResponse.json(results)
}
