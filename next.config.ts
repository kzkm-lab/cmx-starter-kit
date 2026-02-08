import type { NextConfig } from "next"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

// Initialize OpenNext for local development
initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@cmx/api-client", "@cmx/config", "@cmx/database", "@cmx/ui", "@cmx/mdx"],
}

export default nextConfig
