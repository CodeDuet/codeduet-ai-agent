# CodeDuet AI Studio

**CodeDuet** is a local Electron app for AI-powered code generation with multi-agent collaboration.

**Stack**: Electron + React 19 + TypeScript + Vite + Python FastAPI + SQLite + Drizzle ORM + Tailwind CSS + Radix UI

**Structure**: `src/` (main app), `packages/ai-agents/` (Python backend), `scaffold/` (templates), `e2e-tests/`, `drizzle/` (migrations)

## Development Commands

```bash
npm start                   # Start development server
npm run ts                 # TypeScript check
npm run lint               # Run oxlint
npm test                   # Run unit tests
npm run db:generate        # Generate migrations
npm run db:push           # Push schema changes
```

## AI Agents Setup

```bash
./setup-ai-agents.sh       # Automatic setup
# OR manual: cd packages/ai-agents && pip install -r requirements.txt
```

## Key Files

- `src/main.ts` - Electron main process
- `src/db/schema.ts` - Database schema
- `packages/ai-agents/start.py` - AI backend entry

## Change Management Rules

**MANDATORY**: When making ANY changes to the codebase:

1. **Always update CHANGES.md**:
   - Add entry with date, change type, and description
   - Include affected files/components
   - Note any breaking changes or migration steps

2. **Update documentation**:
   - Modify relevant docs/ files for new features
   - Update API documentation for endpoint changes
   - Update config examples for new parameters
   - Update README.md if setup/usage changes

3. **Unit testing requirement**:
   - All changes MUST pass unit tests before implementation is considered complete
   - Run `pytest tests/unit/` to verify all unit tests pass
   - If unit tests fail and issues cannot be fixed, changes must be rolled back
   - New functionality requires corresponding unit tests
   - **NEVER use static mock data in production code for testing purposes**
     - Mock data should only exist in test files (tests/ directory)
     - Production code must not contain hardcoded test responses or fake data
     - Use proper mocking frameworks (unittest.mock, pytest-mock) in tests only
     - All API responses must come from real business logic, not embedded test data

4. **Change tracking format**:
   ```
   ## [YYYY-MM-DD] - Change Type
   ### Changed/Added/Fixed/Removed
   - Description of change (files: path/to/file.py)
   - Breaking change note if applicable
   ```
