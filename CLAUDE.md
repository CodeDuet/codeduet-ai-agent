# CodeDuet AI Agent - Claude Migration Guide

## Project Overview

**CodeDuet** is a local, open-source AI app builder forked from Dyad. It's an Electron-based application with a React frontend that provides AI-powered code generation and multi-agent collaboration capabilities.

- **Main Application**: Electron + React + TypeScript + Vite
- **AI Agents Backend**: Python FastAPI backend with 6 specialized AI agents
- **Database**: SQLite with Drizzle ORM
- **UI Framework**: React 19 + Tailwind CSS + Radix UI components

## Key Features

- 100% local development environment
- Multi-agent AI collaboration system
- Supabase and Vercel integrations
- Real-time preview and live reload
- Component selection and tagging system
- GitHub integration for project management

## Directory Structure

```
codeduet-ai-agent/
├── src/                        # Main Electron app source
│   ├── main.ts                 # Electron main process
│   ├── preload.ts             # Electron preload script
│   ├── renderer.tsx           # React app entry
│   ├── components/            # React components
│   ├── hooks/                 # React hooks
│   ├── ipc/                   # IPC handlers and utilities
│   ├── db/                    # Database schema and migrations
│   └── styles/                # Global styles
├── packages/
│   ├── ai-agents/             # Python FastAPI backend for AI agents
│   └── @codeduet-sh/          # Internal packages
├── scaffold/                  # Template for new projects
├── e2e-tests/                 # Playwright E2E tests
├── docs/                      # Architecture documentation
├── drizzle/                   # Database migrations
└── public/                    # Static assets
```

## Tech Stack

### Frontend (Electron + React)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Jotai atoms
- **Routing**: TanStack Router
- **UI Components**: Radix UI + Tailwind CSS
- **Code Editor**: Monaco Editor
- **Database**: SQLite with Drizzle ORM

### Backend (AI Agents)

- **Framework**: Python FastAPI
- **AI Integration**: Multiple provider support (OpenAI, Anthropic, etc.)
- **WebSocket**: Real-time communication
- **Architecture**: 6 specialized AI agents (Manager, Architect, Engineer, Reviewer, DevOps, Verifier)

## Development Commands

```bash
# Main application
npm start                   # Start development server
npm run dev:engine         # Start with local engine
npm run package            # Package for distribution
npm run make               # Build distributables

# Type checking and linting
npm run ts                 # TypeScript check (main + workers)
npm run lint               # Run oxlint
npm run prettier           # Format code

# Database
npm run db:generate        # Generate migrations
npm run db:push           # Push schema changes
npm run db:studio         # Open Drizzle Studio

# Testing
npm test                   # Run unit tests
npm run e2e               # Run E2E tests (requires package build)
```

## AI Agents Setup

### Quick Start

```bash
# Automatic setup (recommended)
./setup-ai-agents.sh

# Manual setup
cd packages/ai-agents
pip install -r requirements.txt
cp .env.example .env
# Edit .env with API keys
python start.py
```

### Environment Configuration

Create `packages/ai-agents/.env`:

```env
# AI Provider Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Backend Configuration
APP_PORT=8001
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key
```

## Migration Considerations

### Dependencies to Address

1. **@dyad-sh/supabase-management-js** - Used for Supabase integration
2. **Component Taggers** - Located in `packages/@codeduet-sh/` but need npm publishing

### Key Integration Points

- Supabase integration in `src/supabase_admin/`
- Vercel deployment in `src/components/VercelIntegration.tsx`
- GitHub integration in `src/components/GitHubIntegration.tsx`
- Template system in `scaffold/`

### Database Schema

- SQLite database with Drizzle ORM
- Schema defined in `src/db/schema.ts`
- Migrations in `drizzle/` directory

### Build and Distribution

- Uses Electron Forge for packaging
- Supports macOS (.dmg), Windows (.exe), and Linux (.deb/.rpm)
- GitHub Actions for automated releases

## Important Files for Migration

### Configuration Files

- `package.json` - Main dependencies and scripts
- `forge.config.ts` - Electron Forge configuration
- `vite.*.config.mts` - Vite build configurations
- `drizzle.config.ts` - Database configuration
- `biome.json` - Code formatting configuration

### Core Application Files

- `src/main.ts` - Electron main process
- `src/renderer.tsx` - React app entry
- `src/router.ts` - Application routing
- `src/db/schema.ts` - Database schema

### AI Agents Backend

- `packages/ai-agents/start.py` - Backend entry point
- `packages/ai-agents/app/main.py` - FastAPI application
- `packages/ai-agents/app/agents/` - Individual agent implementations

### Templates and Scaffolding

- `scaffold/` - Template for new React projects
- `e2e-tests/fixtures/` - Test project templates

## Testing

### Unit Tests

- Vitest for unit testing
- Tests in `src/__tests__/`
- Run with `npm test`

### E2E Tests

- Playwright for end-to-end testing
- Tests in `e2e-tests/`
- Requires packaging first: `npm run pre:e2e && npm run e2e`

## Security Notes

- All AI processing happens locally
- API keys stored in local .env files
- No cloud dependencies for core functionality
- Supabase/Vercel integrations are optional

## Performance Considerations

- AI Agents backend can be resource-intensive
- Recommend Python 3.11+ for optimal performance
- Large projects may require increased memory allocation
- Real-time WebSocket communication for agent updates

## Migration Checklist

1. **Dependencies**: Fork and republish Dyad packages
2. **Environment**: Set up AI provider API keys
3. **Database**: Ensure SQLite and migrations work
4. **AI Agents**: Install Python dependencies and test backend
5. **Integrations**: Configure Supabase/Vercel if needed
6. **Testing**: Run full test suite to verify functionality
7. **Build**: Test packaging and distribution

This documentation provides a comprehensive overview for migrating the CodeDuet AI Agent codebase to a new environment while maintaining all functionality and understanding the system architecture.
