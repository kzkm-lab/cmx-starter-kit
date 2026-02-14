import { compile } from "@mdx-js/mdx"
import { isValidComponent, validateComponentProps, ComponentName } from "./component-catalog"

// ============================================
// Validation Error Types
// ============================================

export interface ValidationError {
  type: "syntax" | "forbidden" | "component" | "props"
  message: string
  line?: number
  column?: number
  component?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
  references: {
    contentIds: string[]
    assetIds: string[]
  }
}

// ============================================
// Forbidden Patterns
// ============================================

const FORBIDDEN_PATTERNS = [
  // import/export statements
  { pattern: /^\s*import\s+/m, message: "import文は使用できません" },
  { pattern: /^\s*export\s+/m, message: "export文は使用できません" },
  // JS expressions in curly braces (except component props)
  { pattern: /\{[^}]*(?:=>|function|new\s+|typeof|instanceof)[^}]*\}/m, message: "JavaScript式は使用できません" },
  // eval, Function constructor
  { pattern: /\beval\s*\(/m, message: "evalは使用できません" },
  { pattern: /\bnew\s+Function\s*\(/m, message: "Function constructorは使用できません" },
  // script tags
  { pattern: /<script[\s>]/i, message: "scriptタグは使用できません" },
  // on* event handlers
  { pattern: /\bon\w+\s*=/i, message: "イベントハンドラ属性は使用できません" },
  // javascript: URLs
  { pattern: /javascript\s*:/i, message: "javascript: URLは使用できません" },
  // data: URLs (for images - can be XSS vector)
  { pattern: /src\s*=\s*["']?\s*data:/i, message: "data: URLは使用できません" },
]

// ============================================
// Component Extraction
// ============================================

interface ExtractedComponent {
  name: string
  props: Record<string, unknown>
  line: number
}

function extractComponents(mdx: string): ExtractedComponent[] {
  const components: ExtractedComponent[] = []
  const lines = mdx.split("\n")

  // Simple regex to find JSX-like components
  // <ComponentName prop="value" prop2={expression} />
  const componentPattern = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*\/?>/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match

    while ((match = componentPattern.exec(line)) !== null) {
      const name = match[1]
      const propsString = match[2]
      const props = parseProps(propsString)

      components.push({
        name,
        props,
        line: i + 1,
      })
    }
  }

  return components
}

function parseProps(propsString: string): Record<string, unknown> {
  const props: Record<string, unknown> = {}

  // Match prop="value" or prop={value} patterns
  const propPattern = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g
  let match

  while ((match = propPattern.exec(propsString)) !== null) {
    const key = match[1]
    const stringValue = match[2] ?? match[3]
    const expressionValue = match[4]

    if (stringValue !== undefined) {
      props[key] = stringValue
    } else if (expressionValue !== undefined) {
      // Try to parse simple values
      const trimmed = expressionValue.trim()
      if (trimmed === "true") {
        props[key] = true
      } else if (trimmed === "false") {
        props[key] = false
      } else if (/^\d+$/.test(trimmed)) {
        props[key] = parseInt(trimmed, 10)
      } else if (/^\d+\.\d+$/.test(trimmed)) {
        props[key] = parseFloat(trimmed)
      } else if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        // Try to parse array
        try {
          props[key] = JSON.parse(trimmed.replace(/'/g, '"'))
        } catch {
          props[key] = trimmed
        }
      } else {
        props[key] = trimmed
      }
    }
  }

  // Handle boolean props without value (e.g., <CodeBlock showLineNumbers />)
  const booleanPattern = /(?:^|\s)(\w+)(?=\s|\/|>|$)/g
  while ((match = booleanPattern.exec(propsString)) !== null) {
    const key = match[1]
    if (!(key in props)) {
      props[key] = true
    }
  }

  return props
}

// ============================================
// Extract References
// ============================================

function extractReferences(components: ExtractedComponent[]): {
  contentIds: string[]
  assetIds: string[]
} {
  const contentIds: string[] = []
  const assetIds: string[] = []

  for (const component of components) {
    if (component.name === "BlogCard" && typeof component.props.contentId === "string") {
      contentIds.push(component.props.contentId)
    }
    if (component.name === "Image" && typeof component.props.assetId === "string") {
      assetIds.push(component.props.assetId)
    }
  }

  return {
    contentIds: [...new Set(contentIds)],
    assetIds: [...new Set(assetIds)],
  }
}

// ============================================
// Main Validation Function
// ============================================

export async function validateMdx(mdx: string): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // 1. Check forbidden patterns
  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(mdx)) {
      const lines = mdx.split("\n")
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          errors.push({
            type: "forbidden",
            message,
            line: i + 1,
          })
          break
        }
      }
    }
  }

  // 2. Try to compile MDX (syntax check)
  try {
    await compile(mdx, {
      development: false,
      // Minimal compilation to check syntax
    })
  } catch (error) {
    const err = error as Error & { line?: number; column?: number }
    errors.push({
      type: "syntax",
      message: err.message,
      line: err.line,
      column: err.column,
    })
  }

  // 3. Extract and validate components
  const components = extractComponents(mdx)

  for (const component of components) {
    // Check if component is in catalog
    if (!isValidComponent(component.name)) {
      errors.push({
        type: "component",
        message: `未知のコンポーネント: ${component.name}`,
        line: component.line,
        component: component.name,
      })
      continue
    }

    // Validate props
    const result = validateComponentProps(component.name as ComponentName, component.props)
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          type: "props",
          message: `${component.name}: ${issue.path.join(".")} - ${issue.message}`,
          line: component.line,
          component: component.name,
        })
      }
    }
  }

  // 4. Extract references
  const references = extractReferences(components)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    references,
  }
}

// ============================================
// Quick Validation (for save)
// ============================================

export function quickValidateMdx(mdx: string): {
  valid: boolean
  errors: ValidationError[]
} {
  const errors: ValidationError[] = []

  // Only check forbidden patterns (fast)
  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(mdx)) {
      errors.push({
        type: "forbidden",
        message,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
