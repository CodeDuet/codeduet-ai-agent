# Dyad Dependencies

This document lists all the original Dyad npm packages that CodeDuet depends on. These packages need to be forked and republished under new organization names to fully decouple from the original Dyad ecosystem.

## Required Dyad NPM Packages to Fork

### 1. @dyad-sh/supabase-management-js

- **Current Version**: v1.0.0
- **Location**: Used in main package.json as dependency
- **Purpose**: Supabase management utilities
- **Usage**: Imported in `src/supabase_admin/supabase_management_client.ts`
- **NPM**: https://www.npmjs.com/package/@dyad-sh/supabase-management-js

### 2. @dyad-sh/react-vite-component-tagger

- **Current Version**: ^0.8.0
- **Location**: Used in scaffold/package.json as devDependency
- **Purpose**: Vite plugin that adds data attributes to React components for AI component selection
- **Usage**:
  - Imported in `scaffold/vite.config.ts`
  - Referenced in upgrade handlers in `src/ipc/handlers/app_upgrade_handlers.ts`
- **Local Package**: Available in `packages/@codeduet-sh/react-vite-component-tagger/`
- **NPM**: https://www.npmjs.com/package/@dyad-sh/react-vite-component-tagger

### 3. @dyad-sh/nextjs-webpack-component-tagger

- **Current Version**: ^0.8.0
- **Location**: Local package only (not currently used as dependency)
- **Purpose**: Next.js webpack loader that adds data attributes to React components
- **Usage**: Referenced in upgrade handlers for Next.js projects
- **Local Package**: Available in `packages/@codeduet-sh/nextjs-webpack-component-tagger/`
- **NPM**: https://www.npmjs.com/package/@dyad-sh/nextjs-webpack-component-tagger

## Fork Action Required

To complete the decoupling from Dyad, you should:

1. **Fork and republish these packages** under your own npm organization (e.g., `@codeduet/` or `@your-org/`)

2. **Update package references** in:

   - `package.json` (main dependency)
   - `scaffold/package.json` (template dependency)
   - `src/ipc/handlers/app_upgrade_handlers.ts` (upgrade logic)
   - `scaffold/vite.config.ts` (vite plugin import)

3. **Local packages to publish**:
   - The packages in `packages/@codeduet-sh/` directory are already renamed but need to be published to npm under your organization

## Package Functionality

### Component Taggers

Both component tagger packages serve the same core purpose - they automatically add `data-*` attributes to React components during build time. This enables the AI to identify and select specific components in the generated applications.

**Example transformation:**

```jsx
// Before
<Button>Click me</Button>

// After
<Button data-component-name="Button" data-file-path="src/components/Button.tsx">
  Click me
</Button>
```

### Supabase Management

The supabase management package provides utilities for programmatically managing Supabase projects, databases, and configurations from within the CodeDuet application.

## Migration Strategy

1. **Immediate**: Update `@dyad-sh/supabase-management-js` reference to use a forked version
2. **Short-term**: Publish the local component tagger packages under your organization
3. **Long-term**: Consider whether these dependencies are needed or if functionality can be internalized
