# CodeDuet Changes Log

This document details all changes made during the fork and rebrand from Dyad to CodeDuet.

## 🆕 Latest Features & Enhancements

### 💳 Next.js + Stripe v2 Template (v0.22.2)

**New Template Added:**
- **Next.js + Stripe v2 Template**: Enhanced template with modern payment flows and subscription management
  - **ID**: `nextjs-stripe-v2`
  - **Repository**: `https://github.com/CodeDuet/nextjs-stripe-template-v2`
  - **Features**: Modern payment flows, subscription management, comprehensive webhook handling, TypeScript, Tailwind CSS
  - **File**: `src/shared/templates.ts:65-72`

**Template Updates:**
- **Fixed Next.js + Stripe Template Image**: Updated broken image URL and GitHub repository URL
  - **File**: `src/shared/templates.ts:46-53`
  - **Image URL**: Updated to `https://github.com/CodeDuet/nextjs-stripe-template/blob/main/public/demo.png`
  - **Repository**: Updated to use correct CodeDuet organization URL

### 🖼️ Template Image Fix (v0.22.1)

**Bug Fix:**
- **Fixed Next.js + Stripe Template Image**: Corrected broken image URL in template display
  - **File**: `src/shared/templates.ts:50`
  - **Issue**: Invalid GitHub assets URL causing broken image in template hub
  - **Solution**: Updated to proper GitHub assets URL format

## 🆕 Previous Features & Enhancements

### 💳 Stripe Integration System (v0.22.0)

**New Features:**
- **Next.js + Stripe Template**: Pre-configured template with Stripe payments ready for Vercel deployment
- **Integration Shortcuts**: Visual button and slash commands for easy integration setup
- **Automatic Environment Setup**: Auto-installs packages and configures environment variables
- **Smart Integration UI**: Dedicated setup flow with API key validation and package installation

**How to Use:**
1. **Templates**: Select "Next.js + Stripe Template" from the Hub for new projects
2. **Integration Button**: Click ⚡ "Integrations" in chat → Select "Stripe" for existing projects  
3. **Slash Commands**: Type `/stripe` or `/supabase` and press Enter
4. **Manual Tags**: Still supports `<codeduet-add-integration provider="stripe">` format

**Technical Implementation:**
- Created `StripeIntegration.tsx` component with API key collection and validation
- Added `IntegrationShortcuts.tsx` popover with visual integration options
- Implemented slash command handler in `ChatInput.tsx` for `/stripe` and `/supabase`
- Updated app-details page to show integration setup when `?integration=stripe` parameter is present

### 🔧 Chat Tag System Migration (v0.22.0)

**Breaking Change - Tag Prefix Migration:**
- **Old Format**: `<dyad-*>` tags (e.g., `<dyad-add-integration>`)
- **New Format**: `<codeduet-*>` tags (e.g., `<codeduet-add-integration>`)

**Updated Components:**
- Renamed all chat components from `Dyad*` to `CodeDuet*` (e.g., `DyadAddIntegration` → `CodeDuetAddIntegration`)
- Updated `CodeDuetMarkdownParser.tsx` to recognize new `codeduet-*` tag format
- Migrated all integration tags: `codeduet-write`, `codeduet-edit`, `codeduet-delete`, `codeduet-add-integration`, etc.
- Updated tag parsing logic in `preprocessUnclosedTags()` function

**Backward Compatibility**: Old `dyad-*` tags will no longer work and should be updated to `codeduet-*` format.

### 📟 System Messages & Logging Migration (v0.22.0)

**User-Visible System Messages:**
- **Proxy Server Messages**: Updated from `[dyad-proxy-server]started=` to `[codeduet-proxy-server]started=`
  - **Files Updated**: `src/ipc/handlers/app_handlers.ts`, `src/hooks/useRunApp.ts`
  - **Impact**: System Messages panel now shows CodeDuet branding instead of Dyad

**Internal Logging Updates:**
- **Engine Creation**: Log messages changed from "creating dyad engine" to "creating codeduet engine"
  - **File**: `src/ipc/utils/llm_engine_provider.ts:74`
- **Logger Scopes**: Updated scope names from `"dyad_tag_parser"` to `"codeduet_tag_parser"`
  - **File**: `src/ipc/utils/dyad_tag_parser.ts:5`

**Preserved for Compatibility:**
- Legacy dyad tag parsing functions maintained for backward compatibility with AI model responses
- Internal processing still recognizes old dyad tags to handle existing chat responses

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

1. ✅ **Publish Forked Packages**: ~~Create and publish npm packages under `@codeduet/` organization~~ - **COMPLETED**
   - Published `@codeduet-sh/supabase-management-js` v1.0.1
   - Local packages structure established under `packages/@codeduet-sh/`
   - Package management integrated into build system (`npm run build:packages`)

2. ✅ **Update Dependencies**: ~~Replace `@dyad-sh/` packages with forked versions~~ - **COMPLETED**
   - Updated main package.json to use `@codeduet-sh/supabase-management-js` v1.0.0
   - Workspace configuration updated to include `packages/@codeduet-sh/*`
   - Build pipeline configured for local package compilation

3. **User Data Migration**: Implement migration for existing "dyad-apps" directories
4. **Feature Implementation**: Begin Phase 1 of FEATURE_REQUEST.md roadmap

---

_This changelog documents the complete transformation from Dyad to CodeDuet, including rebranding, telemetry removal, and future feature planning._
