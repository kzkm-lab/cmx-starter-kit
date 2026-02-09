# Component Definition Reference

Complete reference for CMX custom component definitions.

## Table of Contents

- [Definition Format](#definition-format)
- [Field Reference](#field-reference)
- [Props Schema](#props-schema)
- [Examples Format](#examples-format)
- [Categories](#categories)
- [Environments](#environments)
- [Validation Rules](#validation-rules)
- [Best Practices](#best-practices)

## Definition Format

Component definitions are JSON files placed in `cmx/components/`:

```json
{
  "name": "ComponentName",
  "displayName": "Display Name",
  "description": "Component description",
  "category": "content",
  "environment": "production",
  "propsSchema": {
    "propName": {
      "type": "string",
      "description": "Prop description",
      "required": true
    }
  },
  "examples": [
    "propName=\"example value\""
  ]
}
```

## Field Reference

### `name` (required)

**Type:** `string`

**Description:** Component name used in MDX. Must be PascalCase and unique within workspace.

**Rules:**
- Must start with uppercase letter
- Can only contain letters and numbers
- No spaces or special characters
- Should match React component name

**Examples:**
```json
"name": "FeatureCard"        // ✅ Valid
"name": "AlertBox"           // ✅ Valid
"name": "featureCard"        // ❌ Invalid - not PascalCase
"name": "Feature Card"       // ❌ Invalid - contains space
"name": "Feature-Card"       // ❌ Invalid - contains hyphen
```

### `displayName` (required)

**Type:** `string`

**Description:** Human-readable name shown in CMX Admin UI.

**Rules:**
- Can contain spaces and special characters
- Should be descriptive but concise
- Typically 2-4 words

**Examples:**
```json
"displayName": "Feature Card"           // ✅ Good
"displayName": "Alert Box with Icon"   // ✅ Good
"displayName": "FC"                     // ❌ Too short
"displayName": "A beautiful feature card component with icon and description"  // ❌ Too long
```

### `description` (required)

**Type:** `string`

**Description:** Detailed explanation of component purpose and usage.

**Rules:**
- Should be 1-2 sentences
- Describe what the component does
- Mention key features or use cases

**Examples:**
```json
"description": "Display a feature with icon, title, and description in a card layout"  // ✅ Good
"description": "Highlight important information with different severity levels"        // ✅ Good
"description": "Card"                                                                    // ❌ Too vague
```

### `category` (required)

**Type:** `string`

**Description:** Component category for organization in CMX Admin.

**Valid Values:**
- `content` - Content display components
- `layout` - Layout and structure
- `media` - Media embedding
- `interactive` - Interactive elements
- `data` - Data visualization
- `form` - Form elements
- `navigation` - Navigation components

**Examples:**
```json
"category": "content"      // For cards, callouts, alerts
"category": "media"        // For image galleries, video players
"category": "interactive"  // For tabs, accordions, modals
"category": "data"         // For charts, tables, stats
```

### `environment` (required)

**Type:** `string`

**Description:** Environment where component is available.

**Valid Values:**
- `production` - Available in production only
- `staging` - Available in staging only
- `preview/pr-{number}` - Available in specific PR preview
- `preview/*` - Available in all preview environments

**Examples:**
```json
"environment": "production"      // Stable, released components
"environment": "staging"         // Testing before production
"environment": "preview/pr-123"  // Specific PR testing
```

**Notes:**
- Use `production` for stable, tested components
- Use `staging` to test before promoting to production
- Use `preview/*` for experimental features in PRs

### `propsSchema` (required)

**Type:** `object`

**Description:** Schema defining component props with types and validation.

See [Props Schema](#props-schema) section for details.

### `examples` (optional)

**Type:** `array<string>`

**Description:** Example usage strings shown in CMX Admin.

**Rules:**
- Provide 2-3 examples
- Show different prop combinations
- Use realistic values
- Include self-closing tag syntax

**Examples:**
```json
"examples": [
  "title=\"Welcome\" description=\"Get started quickly\"",
  "title=\"Features\" description=\"See what we offer\" icon=\"star\"",
  "title=\"Contact\" description=\"Get in touch\""
]
```

## Props Schema

Props schema defines the structure and validation for component props.

### Schema Structure

```json
"propsSchema": {
  "propName": {
    "type": "string",
    "description": "Prop description",
    "required": true,
    "optional": false,
    "default": "default value"
  }
}
```

### `type` (required)

**Valid Values:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false flags
- `array` - Lists of items
- `object` - Complex nested data
- `any` - Any value (use sparingly)

**Examples:**
```json
{
  "title": { "type": "string" },
  "count": { "type": "number" },
  "enabled": { "type": "boolean" },
  "items": { "type": "array" },
  "config": { "type": "object" },
  "children": { "type": "any" }
}
```

### `description` (required)

**Type:** `string`

**Description:** Clear explanation of prop purpose and usage.

**Best Practices:**
- Be specific about expected values
- Mention constraints or formats
- Include units if applicable

**Examples:**
```json
"description": "Feature title (max 50 characters)"                    // ✅ Good
"description": "Image URL or path (supports HTTPS or relative paths)" // ✅ Good
"description": "Title"                                                 // ❌ Too vague
```

### `required` / `optional`

**Type:** `boolean`

**Description:** Whether prop is required or optional.

**Rules:**
- Use `"required": true` for required props
- Use `"optional": true` for optional props
- One must be specified

**Examples:**
```json
{
  "title": {
    "type": "string",
    "required": true    // ✅ Must be provided
  },
  "subtitle": {
    "type": "string",
    "optional": true    // ✅ Can be omitted
  }
}
```

### `default` (optional)

**Type:** `any`

**Description:** Default value if prop is not provided.

**Notes:**
- Only for optional props
- Must match the specified type

**Examples:**
```json
{
  "variant": {
    "type": "string",
    "optional": true,
    "default": "primary"
  },
  "count": {
    "type": "number",
    "optional": true,
    "default": 0
  }
}
```

## Examples Format

Examples show how to use the component in MDX content.

### Self-Closing Components

```json
"examples": [
  "title=\"Example\" count={42}",
  "title=\"Another\" enabled={true}"
]
```

Renders as:
```mdx
<ComponentName title="Example" count={42} />
<ComponentName title="Another" enabled={true} />
```

### Components with Children

```json
"examples": [
  "title=\"Title\">Content here</ComponentName>"
]
```

Renders as:
```mdx
<ComponentName title="Title">
  Content here
</ComponentName>
```

### Complex Props

```json
"examples": [
  "items={[{name: 'Item 1', value: 100}, {name: 'Item 2', value: 200}]}"
]
```

## Categories

### Content Components

**Category:** `content`

**Use for:** Cards, callouts, alerts, boxes

**Examples:**
- Feature cards
- Info boxes
- Alert messages
- Callout blocks

### Layout Components

**Category:** `layout`

**Use for:** Grid systems, containers, sections

**Examples:**
- Grid layouts
- Containers
- Sections
- Spacers

### Media Components

**Category:** `media`

**Use for:** Images, videos, embeds

**Examples:**
- Image galleries
- Video players
- YouTube embeds
- Audio players

### Interactive Components

**Category:** `interactive`

**Use for:** User interaction elements

**Examples:**
- Tabs
- Accordions
- Modals
- Dropdowns

### Data Components

**Category:** `data`

**Use for:** Data visualization

**Examples:**
- Charts
- Tables
- Statistics
- Progress bars

### Form Components

**Category:** `form`

**Use for:** Form inputs and controls

**Examples:**
- Text inputs
- Buttons
- Checkboxes
- Select dropdowns

### Navigation Components

**Category:** `navigation`

**Use for:** Navigation elements

**Examples:**
- Breadcrumbs
- Pagination
- Table of contents
- Menu items

## Environments

### Production

**Value:** `"production"`

**Use for:**
- Stable, well-tested components
- Components used in published content
- Components ready for end users

**Deployment:**
- Available on `main` branch
- Synced automatically on push to main

### Staging

**Value:** `"staging"`

**Use for:**
- Components being tested before production
- Components under review
- Beta features

**Deployment:**
- Available on `develop` branch
- Synced automatically on push to develop

### Preview

**Value:** `"preview/pr-{number}"` or `"preview/*"`

**Use for:**
- Experimental features
- Testing in pull requests
- Component development

**Deployment:**
- Available in PR previews
- Automatically cleaned up when PR closes

## Validation Rules

### Component Name Validation

- Must be PascalCase
- Start with uppercase letter
- Only letters and numbers
- No spaces or special characters
- Must be unique in workspace

### Props Schema Validation

- All props must have `type`
- All props must have `description`
- Each prop must specify `required: true` or `optional: true`
- Default values must match type
- Prop names must be camelCase

### Environment Validation

- Must be valid environment string
- Cannot be empty
- Must match pattern: `production`, `staging`, or `preview/*`

### Examples Validation

- Must be array of strings
- Each example should be valid MDX syntax
- Should demonstrate different prop combinations

## Best Practices

### Naming

✅ **Good:**
```json
"name": "FeatureCard"
"name": "AlertBox"
"name": "ImageGallery"
```

❌ **Bad:**
```json
"name": "feature_card"
"name": "alert"
"name": "Component1"
```

### Descriptions

✅ **Good:**
```json
"description": "Display a feature with icon, title, and description in a card layout"
```

❌ **Bad:**
```json
"description": "Card component"
```

### Props

✅ **Good:**
```json
{
  "title": {
    "type": "string",
    "description": "Card title (max 50 characters)",
    "required": true
  },
  "icon": {
    "type": "string",
    "description": "Lucide icon name (e.g., 'star', 'check')",
    "optional": true
  }
}
```

❌ **Bad:**
```json
{
  "title": {
    "type": "string",
    "description": "Title"
  },
  "icon": {
    "type": "string"
  }
}
```

### Examples

✅ **Good:**
```json
"examples": [
  "title=\"Quick Start\" icon=\"zap\"",
  "title=\"Easy to Use\" icon=\"smile\"",
  "title=\"Powerful Features\""
]
```

❌ **Bad:**
```json
"examples": [
  "title=\"Test\""
]
```

## Complete Example

Here's a complete, well-structured component definition:

```json
{
  "name": "FeatureCard",
  "displayName": "Feature Card",
  "description": "Display a feature with icon, title, description, and optional link in a card layout",
  "category": "content",
  "environment": "production",
  "propsSchema": {
    "title": {
      "type": "string",
      "description": "Feature title (max 50 characters)",
      "required": true
    },
    "description": {
      "type": "string",
      "description": "Feature description (max 200 characters)",
      "required": true
    },
    "icon": {
      "type": "string",
      "description": "Lucide icon name (e.g., 'star', 'zap', 'check')",
      "optional": true
    },
    "href": {
      "type": "string",
      "description": "Optional link URL (absolute or relative)",
      "optional": true
    },
    "variant": {
      "type": "string",
      "description": "Visual style: 'default', 'primary', 'success'",
      "optional": true,
      "default": "default"
    }
  },
  "examples": [
    "title=\"Fast Performance\" description=\"Lightning fast load times\" icon=\"zap\"",
    "title=\"Easy to Use\" description=\"Simple and intuitive interface\" icon=\"smile\" href=\"/docs\"",
    "title=\"Secure\" description=\"Enterprise-grade security\" icon=\"shield\" variant=\"primary\""
  ]
}
```

## Troubleshooting

### Component Not Syncing

**Problem:** Component definition not syncing to CMX Admin

**Solutions:**
1. Validate JSON syntax
2. Check all required fields are present
3. Verify file is in `cmx/components/` directory
4. Run `pnpm sync-components` to see errors

### Invalid Schema

**Problem:** Props schema validation fails

**Solutions:**
1. Ensure all props have `type` and `description`
2. Check that `required` or `optional` is set for each prop
3. Verify default values match prop types
4. Use only valid prop types

### Component Not Available in Editor

**Problem:** Component doesn't appear in CMX Admin

**Solutions:**
1. Check `environment` matches current environment
2. Verify component is synced (check sync logs)
3. Refresh CMX Admin page
4. Check for duplicate names in workspace

## Resources

- [CMX Documentation](https://github.com/yourusername/cmx)
- [Setup Guide](./SETUP.md)
- [Customization Guide](./CUSTOMIZATION.md)
- [Claude Skill: Component Creator](./.claude/commands/cmx-component.md)
