/**
 * MDX Rendering — Thin wrapper over cmx-sdk's renderMdx
 *
 * Injects custom components defined in src/components/custom/
 */

import {
  renderMdx as sdkRenderMdx,
  renderMdxPreview as sdkRenderMdxPreview,
} from "cmx-sdk"

import type { References, RenderResult } from "cmx-sdk"

// Import custom components defined by the user
import * as customComponents from "@/components/custom"

export type { RenderResult }

/**
 * Render MDX content with pre-resolved references from Admin API
 */
export async function renderMdx(
  mdx: string,
  references?: References
): Promise<RenderResult> {
  return sdkRenderMdx(mdx, references, {
    additionalComponents: customComponents as Record<string, React.ComponentType<any>>,
  })
}

/**
 * Render MDX content without reference resolution (for preview)
 */
export async function renderMdxPreview(mdx: string): Promise<React.ReactElement> {
  return sdkRenderMdxPreview(
    mdx,
    customComponents as Record<string, React.ComponentType<any>>
  )
}
