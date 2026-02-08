// Component Catalog
export {
  componentSchemas,
  componentCatalog,
  isValidComponent,
  validateComponentProps,
  getComponentsWithReferences,
  getComponentsByCategory,
  getCatalogForAI,
  type ComponentName,
  type ComponentDefinition,
} from "./component-catalog"

// Validator
export {
  validateMdx,
  quickValidateMdx,
  type ValidationError,
  type ValidationResult,
} from "./validator"

// Renderer - NOT exported from index.ts to avoid DB dependency in client components
// Use direct import: import { renderMdx } from "@/lib/mdx/render"
