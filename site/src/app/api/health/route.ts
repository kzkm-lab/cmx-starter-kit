import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    // Debug: environment variables (temporary)
    debug: {
      CMX_API_URL: process.env.CMX_API_URL || "(not set)",
      CMX_API_KEY: process.env.CMX_API_KEY ? "***set***" : "(not set)",
    },
  })
}
