# CMX Custom Component Creator

**Purpose:** Guide users through creating custom MDX components for CMX with proper structure, validation, and documentation.

**Use when:** User wants to create a new custom component for their CMX-powered site.

**Triggers:**
- "create a custom component"
- "add a new MDX component"
- "make a component for CMX"
- "I need a custom component"

## Component Creation Workflow

Follow these steps to create a complete custom component:

### 1. Component Planning

Ask the user these questions to understand requirements:

1. **Component Purpose:**
   - What does this component do?
   - What content will it display?
   - Who will use it (content editors, developers)?

2. **Component Props:**
   - What data does it need?
   - Which props are required vs optional?
   - What types should props be (string, number, boolean, etc.)?

3. **Visual Design:**
   - Should it match existing components?
   - Any specific styling requirements?
   - Will it use icons or images?

4. **Environment:**
   - Production (released, stable)
   - Staging (testing before release)
   - Preview (PR-specific testing)

### 2. Create Component Definition

Create a JSON file in `.cmx/components/[component-name].json`:

```json
{
  "name": "ComponentName",
  "displayName": "Display Name",
  "description": "What this component does",
  "category": "content",
  "environment": "production",
  "propsSchema": {
    "requiredProp": {
      "type": "string",
      "description": "Description of required prop",
      "required": true
    },
    "optionalProp": {
      "type": "string",
      "description": "Description of optional prop",
      "optional": true
    }
  },
  "examples": [
    "requiredProp=\"Example value\"",
    "requiredProp=\"Example\" optionalProp=\"Optional value\""
  ]
}
```

**Schema Guidelines:**
- Use PascalCase for component name
- Provide clear, concise descriptions
- Include 2-3 usage examples
- Mark props as `required: true` or `optional: true`

**Supported Prop Types:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false flags
- `array` - Lists of items
- `object` - Complex nested data

**Categories:**
- `content` - Content display components
- `layout` - Layout and structure components
- `media` - Media embedding components
- `interactive` - Interactive elements
- `data` - Data visualization components

### 3. Implement React Component

Create the component in `src/components/custom/[ComponentName].tsx`:

```tsx
/**
 * ComponentName
 *
 * Description of what the component does.
 */
export function ComponentName({
  requiredProp,
  optionalProp
}: {
  requiredProp: string;
  optionalProp?: string;
}) {
  return (
    <div className="component-name">
      <h3>{requiredProp}</h3>
      {optionalProp && <p>{optionalProp}</p>}
    </div>
  );
}
```

**Implementation Best Practices:**

1. **Type Safety:**
   - Define explicit prop types
   - Use TypeScript interfaces
   - Validate prop types match JSON schema

2. **Styling:**
   - Use Tailwind CSS classes
   - Follow project's design system
   - Use semantic HTML elements
   - Add appropriate ARIA attributes for accessibility

3. **Performance:**
   - Use React hooks appropriately
   - Memoize expensive computations
   - Lazy load heavy dependencies

4. **Documentation:**
   - Add JSDoc comments
   - Include usage examples in comments
   - Document props clearly

### 4. Export Component

Add the component to `src/components/custom/index.ts`:

```ts
export { ComponentName } from './ComponentName'
```

### 5. Test Component

Create a test MDX file to verify the component:

```mdx
# Component Test

<ComponentName
  requiredProp="Test Value"
  optionalProp="Optional Value"
/>
```

Test in different scenarios:
- With only required props
- With all props
- With invalid props (should show validation errors)
- In different environments (production, staging, preview)

### 6. Sync to CMX Admin

Run the sync command to register the component:

```bash
# Sync to production
pnpm sync-components production

# Or sync to staging
pnpm sync-components staging

# Or let Git branch determine environment
pnpm sync-components
```

Verify in CMX Admin:
1. Go to Settings → Custom Components
2. Find your new component in the list
3. Check that props are correctly defined
4. Test the component in a draft post

## Component Examples

### Example 1: Simple Feature Card

**Definition (`.cmx/components/feature-card.json`):**
```json
{
  "name": "FeatureCard",
  "displayName": "Feature Card",
  "description": "Display a feature with icon, title, and description",
  "category": "content",
  "environment": "production",
  "propsSchema": {
    "title": {
      "type": "string",
      "description": "Feature title",
      "required": true
    },
    "description": {
      "type": "string",
      "description": "Feature description",
      "required": true
    },
    "icon": {
      "type": "string",
      "description": "Lucide icon name",
      "optional": true
    }
  },
  "examples": [
    "title=\"Fast Performance\" description=\"Lightning fast load times\"",
    "title=\"Easy to Use\" description=\"Simple and intuitive\" icon=\"smile\""
  ]
}
```

**Implementation (`src/components/custom/FeatureCard.tsx`):**
```tsx
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

export function FeatureCard({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  const Icon = icon ? (Icons[icon as keyof typeof Icons] as LucideIcon) : null;

  return (
    <div className="rounded-lg border p-6 shadow-sm">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

### Example 2: Alert Box with Variants

**Definition (`.cmx/components/alert-box.json`):**
```json
{
  "name": "AlertBox",
  "displayName": "Alert Box",
  "description": "Display alerts with different severity levels",
  "category": "content",
  "environment": "production",
  "propsSchema": {
    "type": {
      "type": "string",
      "description": "Alert type: info, warning, error, success",
      "required": true
    },
    "title": {
      "type": "string",
      "description": "Alert title",
      "required": true
    },
    "children": {
      "type": "string",
      "description": "Alert message content",
      "required": true
    }
  },
  "examples": [
    "type=\"info\" title=\"Information\" children=\"This is an info alert\"",
    "type=\"warning\" title=\"Warning\" children=\"Please be careful\"",
    "type=\"error\" title=\"Error\" children=\"Something went wrong\""
  ]
}
```

**Implementation (`src/components/custom/AlertBox.tsx`):**
```tsx
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const variants = {
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-900'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-900'
  }
};

export function AlertBox({
  type,
  title,
  children
}: {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  children: React.ReactNode;
}) {
  const variant = variants[type] || variants.info;
  const Icon = variant.icon;

  return (
    <div className={`rounded-lg border p-4 ${variant.className}`}>
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

### Example 3: Stats Grid

**Definition (`.cmx/components/stats-grid.json`):**
```json
{
  "name": "StatsGrid",
  "displayName": "Stats Grid",
  "description": "Display statistics in a responsive grid",
  "category": "data",
  "environment": "production",
  "propsSchema": {
    "stats": {
      "type": "array",
      "description": "Array of stat objects with label and value",
      "required": true
    }
  },
  "examples": [
    "stats={[{label: 'Users', value: '10K'}, {label: 'Posts', value: '500'}]}"
  ]
}
```

**Implementation (`src/components/custom/StatsGrid.tsx`):**
```tsx
export function StatsGrid({
  stats
}: {
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-lg bg-gray-50 p-6 text-center"
        >
          <div className="text-3xl font-bold text-gray-900">
            {stat.value}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### Naming Conventions
- **Components:** PascalCase (e.g., `FeatureCard`, `AlertBox`)
- **Files:** Match component name (e.g., `FeatureCard.tsx`, `feature-card.json`)
- **Props:** camelCase (e.g., `isActive`, `showIcon`)

### Documentation
- Always include clear descriptions in JSON schema
- Provide multiple usage examples
- Document prop types and requirements
- Add JSDoc comments to TypeScript code

### Styling
- Use Tailwind CSS utility classes
- Follow the project's design system
- Ensure responsive design
- Consider dark mode support
- Use semantic HTML elements

### Testing
- Test with only required props
- Test with all props
- Test edge cases (empty strings, null values)
- Test in different environments
- Verify accessibility with screen readers

### Security
- Sanitize user input if displaying raw HTML
- Validate prop types match schema
- Avoid executing arbitrary code
- Be cautious with external URLs

### Performance
- Minimize re-renders
- Use React.memo for expensive components
- Lazy load heavy dependencies
- Optimize images and media

## Troubleshooting

### Component Not Showing in CMX Admin
- Verify JSON syntax is valid
- Check component is in `.cmx/components/` directory
- Run `pnpm sync-components` and check for errors
- Verify environment matches (production/staging/preview)

### Component Not Rendering on Site
- Check component is exported in `src/components/custom/index.ts`
- Verify props match schema definition
- Check browser console for errors
- Ensure TypeScript compilation succeeds

### Props Validation Errors
- Verify required props are provided
- Check prop types match schema
- Ensure prop names match exactly (case-sensitive)
- Review examples in JSON definition

## Checklist

Before considering a component complete, verify:

- [ ] JSON definition created in `.cmx/components/`
- [ ] Component implemented in `src/components/custom/`
- [ ] Component exported in `src/components/custom/index.ts`
- [ ] Props match schema exactly
- [ ] TypeScript types are correct
- [ ] Component is styled appropriately
- [ ] Examples work correctly
- [ ] Component is accessible (ARIA attributes, keyboard navigation)
- [ ] Component is responsive
- [ ] Synced to CMX Admin
- [ ] Tested in CMX editor
- [ ] Documentation is clear

## Resources

- [CMX Documentation](https://github.com/yourusername/cmx)
- [Component Styling Guide](../.cmx/STYLING.md)
- [Setup Guide](../.cmx/SETUP.md)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [MDX Documentation](https://mdxjs.com)
