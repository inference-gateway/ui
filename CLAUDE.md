# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

IMPORTANT: Before starting any feature or task implementations, you have to run `npm run prepare` to install the git pre-commit hook.

## Development Commands

- `npm run dev` - Start the development server (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run lint:fix` - Automatically fix linting issues
- `npm run typecheck` - Run TypeScript type checks
- `npm run format` - Format code using Prettier
- `npm run format:check` - Check code formatting without making changes
- `npm test` - Run tests using Jest and React Testing Library
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:ci` - Run tests in CI mode

## Testing Requirements

**Test Driven Development (TDD) is required for all feature implementations**:

- Follow the Red-Green-Refactor TDD cycle
- Write failing tests first, then implement code to make tests pass
- Every feature must have corresponding tests before being considered complete
- Tests are located in the `/tests` directory
- Use React Testing Library for component testing
- Mock API calls in tests using mocks in `/tests/mocks`

## Architecture Overview

This is a Next.js 15 application with App Router that serves as the UI for the Inference Gateway project. The application enables users to interact with AI models through a chat interface.

### Key Components

- **Chat Interface**: Main user interaction point built with React components
- **API Integration**: Uses the `@inference-gateway/sdk` TypeScript SDK for backend communication
- **Authentication**: Optional NextAuth.js integration with Keycloak support
- **State Management**: React hooks with local storage for chat history persistence
- **Streaming**: Real-time streaming responses from AI models
- **Tools Support**: Integrated web search and page fetch capabilities via MCP tools

### Directory Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components (use kebab-case filenames)
- `/lib` - Utility functions, API client, and services
- `/types` - TypeScript type definitions
- `/tests` - Test files organized by component/feature
- `/hooks` - Custom React hooks
- `/examples` - Docker Compose and Kubernetes deployment examples
- `/charts` - Helm charts for Kubernetes deployment

### Core Files

- `app/chat/page-client.tsx` - Main chat interface component
- `lib/api.ts` - API client for backend communication
- `lib/agent.ts` - Agent loop for handling tool calls
- `lib/storage.ts` - Chat history persistence
- `types/chat.ts` - Core chat-related type definitions

### API Architecture

The application uses a Next.js API layer (`/app/api`) that proxies requests to the Inference Gateway backend:

- `/api/v1/chat/completions` - Main chat completion endpoint
- `/api/v1/models` - List available models
- `/api/v1/mcp/tools` - List available MCP tools
- `/api/auth` - NextAuth.js authentication endpoints

### Authentication

Authentication is optional and controlled by `ENABLE_AUTH` environment variable. When enabled, uses NextAuth.js with Keycloak provider support.

## Development Standards

- Use TypeScript for all new code
- Follow React best practices with hooks
- Use Tailwind CSS for styling
- Use shadcn/ui components (located in `/components/ui`)
- Always use the `@inference-gateway/sdk` for API interactions
- Use `async/await` instead of `.then()/.catch()`
- Prefer `const` over `let`, use `===` instead of `==`
- Use early returns to reduce nesting
- Avoid unnecessary hook abstractions

## Environment Variables

Key environment variables for development:

- `INFERENCE_GATEWAY_URL` - Backend API URL (default: http://localhost:8080/v1)
- `ENABLE_AUTH` - Enable authentication (default: false)
- `NEXT_PUBLIC_LOG_LEVEL` - Client-side logging level
- `LOG_LEVEL` - Server-side logging level

## Coding Conventions

- React components: PascalCase
- Component files: kebab-case
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- TypeScript interfaces: PascalCase (no "I" prefix)
- Custom hooks: start with "use"
