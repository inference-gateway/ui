# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Commands

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Build for production
npm run typecheck        # Run TypeScript type checking

# Testing
npm test                 # Run all tests
npm test -- <pattern>    # Run tests matching pattern (e.g., npm test -- chat-area)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without modifying

# OpenAPI Schema
npm run oas-download     # Download latest OpenAPI schema from inference-gateway/schemas
```

## Architecture

This is a Next.js 15 App Router application that provides a chat UI for the
[Inference Gateway](https://github.com/inference-gateway/inference-gateway)
backend service.

### Directory Structure

- `/app` - Next.js pages, layouts, and API routes (App Router)
- `/components` - React components (chat UI, model selector, tool dialogs)
- `/components/ui` - shadcn/ui base components
- `/lib` - Core utilities and services
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/tests` - Test files mirroring source structure

### Key Patterns

**API Proxy Pattern**: Client-side code calls Next.js API routes
(`/app/api/v1/`), which proxy requests to the Inference Gateway backend.
The backend URL is configured via `INFERENCE_GATEWAY_URL` env var.

**Storage Abstraction**: Chat history supports multiple backends via
`StorageServiceFactory`:

- `local` - Browser localStorage (default)
- `postgres` - PostgreSQL via API routes

**Authentication**: Optional NextAuth.js integration with OIDC providers
(Keycloak, GitHub, Google). Controlled by `AUTH_ENABLE` env var.

**Streaming**: Uses Server-Sent Events (SSE) for streaming chat completions.
See `apiStreamFetch` in `lib/api.ts`.

**Path Aliases**: Use `@/*` for imports from project root (configured in
tsconfig.json).

### Component Patterns

- Uses shadcn/ui components built on Radix UI primitives
- Styling with Tailwind CSS and class-variance-authority (cva) for variants
- Theme support via next-themes (dark mode default)

### Testing

- Jest with React Testing Library
- Tests co-located in `/tests` directory
- Mock files in `/tests/mocks`
- Setup in `/tests/jest-setup.ts`

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
`<type>[scope]: <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
