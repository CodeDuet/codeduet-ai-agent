# CodeDuet Changes Log

This document details all changes made during the fork and rebrand from Dyad to CodeDuet.

## 🏷️ Rebranding Changes

### Package Configuration

- **package.json**
  - Updated `name` from "dyad" to "codeduet"
  - Updated `productName` from "Dyad" to "CodeDuet"
  - Updated repository URL to `https://github.com/codeduet/codeduet-ai-agent.git`
  - Updated homepage to `https://codeduet.com`
  - Changed environment variable from `DYAD_ENGINE_URL` to `CODEDUET_ENGINE_URL`

### File System and Paths

- **src/paths/paths.ts**
  - Renamed function `getDyadAppPath` to `getCodeDuetAppPath`
  - Updated directory paths from "dyad-apps" to "codeduet-apps"

### Component Renaming

- **src/components/modals/DeleteDyadAppModal.tsx** → **DeleteCodeDuetAppModal.tsx**
  - Updated component name and all internal references
  - Updated modal title and descriptions

### Schema and Settings

- **src/lib/schemas.ts**
  - Renamed function `isDyadProEnabled` to `isCodeDuetProEnabled`
  - Updated all schema references and type definitions

### Main Process Configuration

- **src/main/settings.ts**
  - Updated default settings structure
  - Removed telemetry-related default values

### Local Package Structure

- **packages/@codeduet-sh/** directories created/renamed:
  - `react-vite-component-tagger/` - Vite plugin for React component tagging
  - `nextjs-webpack-component-tagger/` - Next.js webpack loader for component tagging

## 🚫 Telemetry Removal

### Complete PostHog Analytics Removal

- **Removed files:**

  - `src/components/TelemetryBanner.tsx`
  - `src/components/TelemetrySwitch.tsx`

- **package.json**
  - Removed `posthog-js` dependency

### Code Cleanup

- **src/renderer.tsx**

  - Removed PostHog imports and initialization
  - Removed PostHogProvider wrapper
  - Removed navigation tracking

- **src/hooks/useSettings.ts**

  - Removed PostHog imports and usage
  - Removed telemetry processing functions
  - Removed localStorage telemetry management
  - Removed `isTelemetryOptedIn()` and `getTelemetryUserId()` functions

- **src/lib/schemas.ts**

  - Removed `telemetryConsent` and `telemetryUserId` fields from settings schema

- **src/main/settings.ts**
  - Removed telemetry default values
  - Removed uuid import for telemetry user ID generation

## 📄 Documentation Updates

### README.md

- Updated title and description to CodeDuet
- Updated website URLs to https://codeduet.com
- Added attribution section crediting original Dyad project:
  ```markdown
  > **Attribution**: CodeDuet is forked from [Dyad](https://github.com/dyad-sh/dyad), an open-source project by [Will Chen](https://github.com/willchen90). We're grateful for the excellent foundation provided by the original Dyad project and its contributors. All original work remains under the Apache 2.0 license.
  ```

## 📦 New Documentation Files Created

### DEPENDENCIES.md

- Comprehensive documentation of Dyad npm packages requiring forking
- Detailed information on:
  - `@dyad-sh/supabase-management-js` - Supabase management utilities
  - `@dyad-sh/react-vite-component-tagger` - Vite plugin for React component data attributes
  - `@dyad-sh/nextjs-webpack-component-tagger` - Next.js webpack loader for component tagging
- Migration strategy and action items for decoupling

### FEATURE_REQUEST.md

- Extensive roadmap for transforming CodeDuet into agentic AI development platform
- Key sections:
  - **Core Sandboxing Infrastructure** - MicroVM isolation, snapshot/restore, multi-environment support
  - **Agentic Workflow Capabilities** - Autonomous testing, deployment, code quality agents
  - **Custom AI Infrastructure** - RunPod.io GPU container integration, self-hosted model support
  - **Advanced Development Features** - Multi-agent collaboration, live environment interaction
  - **Security and Compliance** - Network isolation, resource limits, audit logging
  - **Implementation Roadmap** - 4-phase timeline over 12+ months

#### RunPod.io Integration Features

- Custom GPU inference with Docker containers and acceleration
- Model management and deployment capabilities
- Hybrid inference architecture for cost optimization
- Automatic container scaling and spot instance support

#### Arrakis Sandboxing Integration

- Secure MicroVM execution environments
- Snapshot and restore system for backtracking
- Multi-environment support for different language stacks
- Integration points with existing Arrakis project

## 🔧 Configuration Updates

### Environment Variables

- Updated environment variable naming convention from `DYAD_*` to `CODEDUET_*`
- Maintained backward compatibility during transition

### Build Configuration

- Updated Electron build configuration for new product name
- Updated application metadata and descriptions

## 🚨 Breaking Changes

### API Changes

- Function name changes in `src/paths/paths.ts` will require updates in any external integrations
- Component name changes may affect any custom styling or testing that references specific component names

### File Structure

- Directory path changes from "dyad-apps" to "codeduet-apps" will affect existing user data locations
- Users may need to migrate existing projects to new directory structure

### Dependencies

- Still depends on original `@dyad-sh/` npm packages until forks are published
- Future updates will require publishing forked packages under new organization

## 📊 Impact Summary

### Files Modified: 15+

- Core application files
- Component definitions
- Configuration files
- Build scripts
- Documentation

### Files Created: 3

- DEPENDENCIES.md
- FEATURE_REQUEST.md
- CHANGES.md (this file)

### Files Removed: 2

- TelemetryBanner.tsx
- TelemetrySwitch.tsx

### Dependencies Removed: 1

- posthog-js (analytics)

## 🔮 Next Steps

1. **Publish Forked Packages**: Create and publish npm packages under `@codeduet/` organization
2. **Update Dependencies**: Replace `@dyad-sh/` packages with forked versions
3. **User Data Migration**: Implement migration for existing "dyad-apps" directories
4. **Feature Implementation**: Begin Phase 1 of FEATURE_REQUEST.md roadmap

---

_This changelog documents the complete transformation from Dyad to CodeDuet, including rebranding, telemetry removal, and future feature planning._
