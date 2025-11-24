# AGENTS.md - Inference Gateway UI

This document provides comprehensive guidance for AI agents working with the
Inference Gateway UI project.

## Project Overview

**Inference Gateway UI** is a Next.js 15 application that provides a modern
chat interface for interacting with AI models through the
[Inference Gateway](https://github.com/inference-gateway/inference-gateway)
backend service. It enables seamless access to various language models through
a consistent interface.

### Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Jest + React Testing Library
- **Authentication**: NextAuth.js (optional)
- **Build Tool**: Node.js 22
- **Containerization**: Docker with multi-stage builds
- **Deployment**: Kubernetes via Helm charts

## Architecture & Structure

### Directory Structure

```text
├── app/                    # Next.js App Router pages & layouts
│   ├── api/               # API routes (proxy to backend)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── health/        # Health check endpoint
│   │   └── v1/           # API v1 routes
│   ├── auth/              # Authentication pages
│   └── chat/              # Main chat interface
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Core utilities & services
│   ├── api.ts            # API client & utilities
│   ├── storage.ts        # Storage abstraction layer
│   ├── tools.ts          # Tool definitions & utilities
│   └── utils.ts          # Common utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── tests/                # Test files
└── charts/               # Kubernetes Helm charts
```

### Key Architectural Patterns

#### API Proxy Pattern

- Client-side code calls Next.js API routes (`/app/api/v1/`)
- API routes proxy requests to Inference Gateway backend
- Backend URL configured via `INFERENCE_GATEWAY_URL` environment variable

#### Storage Abstraction

- Supports multiple storage backends via `StorageServiceFactory`
- **Local**: Browser localStorage (default)
- **PostgreSQL**: Database storage via API routes
- Configure via `STORAGE_TYPE` and `DB_CONNECTION_URL` environment variables

#### Authentication

- Optional NextAuth.js integration
- Supports OIDC providers: Keycloak, GitHub, Google
- Controlled by `AUTH_ENABLE` environment variable

#### Streaming

- Uses Server-Sent Events (SSE) for streaming chat completions
- Implemented via `apiStreamFetch` in `lib/api.ts`

## Development Environment Setup

### Prerequisites

- Node.js 22
- npm
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/inference-gateway/ui.git
cd ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will be available at `http://localhost:3000`.

### Environment Configuration

Create a `.env` file with the following variables:

```env
# General Settings
NODE_ENV=development
INFERENCE_GATEWAY_URL=http://localhost:8080
LOG_LEVEL=debug

# Storage Settings
STORAGE_TYPE=local
# DB_CONNECTION_URL=postgresql://user:pass@localhost:5432/db

# Authentication (optional)
AUTH_ENABLE=false
# AUTH_SECURE_COOKIES=false
# NEXTAUTH_SECRET=your-secret-here
```

## Key Commands

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck
```

### Taskfile Commands (Recommended)

The project includes a Taskfile.yml for common development tasks:

```bash
# Development
task dev              # Start development server

# Build & Production
task build            # Build for production
task start            # Start production server

# Code Quality
task format           # Format code with Prettier
task format:check     # Check formatting without changes
task lint             # Run ESLint
task lint:fix         # Fix linting issues automatically
task typecheck        # Run TypeScript type checks

# Testing
task test             # Run all tests
task test:watch       # Run tests in watch mode
task test:coverage    # Run tests with coverage report
task test:ci          # Run tests for CI

# CI & Quality Checks
task ci               # Run all CI checks (lint, typecheck, test)
task quality          # Run all code quality checks

# Project Management
task setup            # Setup project (install deps & prepare)
task clean            # Clean build artifacts and node_modules
```

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- chat-area.test.tsx

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci

# Clear Jest cache
npm run test:clear-cache
```

### Linting & Formatting

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Testing Instructions

### Test Framework

- **Framework**: Jest with React Testing Library
- **Environment**: jsdom for browser simulation
- **Setup**: `/tests/jest-setup.ts` for global test configuration
- **Coverage**: Enabled via `COLLECT_COVERAGE=true` environment variable

### Test Structure

```text
tests/
├── jest-setup.ts           # Global test setup
├── mocks/                  # Mock files
├── [component].test.tsx    # Component tests
└── [lib].test.ts          # Utility tests
```

### Writing Tests

**Component Test Example:**

```tsx
import { render, screen } from '@testing-library/react';
import { ChatArea } from '@/components/chat-area';

describe('ChatArea', () => {
  it('renders chat interface', () => {
    render(<ChatArea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

**API Test Example:**

```tsx
import { describe, it, expect } from '@jest/globals';
import { apiStreamFetch } from '@/lib/api';

describe('apiStreamFetch', () => {
  it('handles streaming responses', async () => {
    // Test implementation
  });
});
```

### Testing Best Practices

- Use `@testing-library/react` for component testing
- Mock external dependencies (API calls, storage)
- Test user interactions and accessibility
- Use descriptive test names
- Follow Arrange-Act-Assert pattern

## Project Conventions & Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer explicit typing over `any`
- Use interfaces for props and data structures
- Enable all strict type checking options

### React Best Practices

- Use functional components with hooks
- Follow React hooks rules
- Use proper prop validation
- Avoid prop drilling (use composition)
- Implement proper error boundaries

### Styling Conventions

- Use Tailwind CSS for styling
- Follow shadcn/ui design system
- Use `class-variance-authority` (cva) for component variants
- Implement dark mode support via `next-themes`

### Code Organization

- **Components**: Co-locate related components
- **Hooks**: Place custom hooks in `/hooks` directory
- **Types**: Define TypeScript types in `/types`
- **Utilities**: Common utilities in `/lib/utils.ts`

### Import Aliases

Use path aliases configured in `tsconfig.json`:

```typescript
// ✅ Recommended
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ❌ Avoid
import { cn } from '../../lib/utils';
```

### Naming Conventions

- **Files**: kebab-case for components (`chat-area.tsx`)
- **Components**: PascalCase (`ChatArea`, `ModelSelector`)
- **Functions**: camelCase (`handleSubmit`, `fetchModels`)
- **Constants**: UPPER_SNAKE_CASE (`SYSTEM_PROMPT`)
- **Types**: PascalCase (`ChatMessage`, `StorageService`)

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>[scope]: <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Important Files & Configurations

### Core Configuration Files

- **`package.json`**: Dependencies, scripts, and project metadata
- **`tsconfig.json`**: TypeScript configuration with path aliases
- **`next.config.ts`**: Next.js configuration (standalone output, experimental features)
- **`tailwind.config.ts`**: Tailwind CSS configuration with shadcn/ui theme
- **`jest.config.ts`**: Jest testing configuration
- **`eslint.config.mjs`**: ESLint configuration
- **`Taskfile.yml`**: Task automation for common development workflows

### Environment Variables

See the complete environment variable documentation in `README.md`. Key variables:

```env
# Required
INFERENCE_GATEWAY_URL=http://localhost:8080

# Optional
STORAGE_TYPE=local|postgres
DB_CONNECTION_URL=postgresql://...
AUTH_ENABLE=false|true
LOG_LEVEL=debug|info|warn|error
```

### Key Directories

- **`/app`**: Next.js App Router pages, layouts, and API routes
- **`/components`**: React components (feature components in root, base in `/ui`)
- **`/lib`**: Core utilities, API clients, storage services
- **`/tests`**: Test files mirroring source structure
- **`/charts`**: Kubernetes Helm charts for deployment

### Development Workflow

1. **Setup**: `task setup` (installs dependencies and prepares Git hooks)
2. **Development**: `task dev` (starts development server)
3. **Testing**: `task test` (runs all tests)
4. **Quality**: `task quality` (runs all code quality checks)
5. **Build**: `task build` (builds for production)

### CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

- **CI Workflow**: Runs on push/PR to main branch
- **Tests**: Lint, typecheck, build, and test
- **Container**: Builds and tests Docker image
- **Release**: Automated releases via semantic-release

## Additional Resources

- [README.md](./README.md) - Project overview and deployment instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CLAUDE.md](./CLAUDE.md) - Claude-specific guidance
- [CHANGELOG.md](./CHANGELOG.md) - Release history

---

This AGENTS.md file provides comprehensive guidance for AI agents working with
the Inference Gateway UI project. Follow the established patterns and
conventions to ensure consistent and maintainable code contributions.
