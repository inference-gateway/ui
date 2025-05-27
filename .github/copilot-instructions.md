# GitHub Copilot Instructions for Inference Gateway UI

- Always use context7 MCP server to find out about the latest documentation of a project before assessing a task.
- Always use early return when possible to reduce nesting and improve readability.
- Always use `async/await` for asynchronous code instead of `.then()` and `.catch()`.
- Always use `const` for variables that are not reassigned and `let` for those that are.
- Always use `===` and `!==` for equality checks instead of `==` and `!=`.
- Avoid using hooks when possible - prefer using standard state management patterns with less abstraction.
- Always use the Official Inference Gateway TypeScript SDK for API interactions instead of manually constructing requests.

## Project Overview

This is a Next.js application serving as the UI for the Inference Gateway project. It enables interacting with AI models through a consistent interface. The UI connects to a backend API service for model inference.

## Related Repositories

- [Inference Gateway](https://github.com/inference-gateway)
  - [Inference Gateway UI](https://github.com/inference-gateway/ui)
  - [Go SDK](https://github.com/inference-gateway/go-sdk)
  - [Rust SDK](https://github.com/inference-gateway/rust-sdk)
  - [TypeScript SDK](https://github.com/inference-gateway/typescript-sdk)
  - [Python SDK](https://github.com/inference-gateway/python-sdk)
  - [Documentation](https://docs.inference-gateway.com)

## Available Tools

- context7 MCP server: Use this to access the latest documentation and project context.

## Available Commands

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run format`: Format code using Prettier
- `npm run format:check`: Check code formatting without making changes
- `npm run lint`: Run ESLint to check for code quality issues
- `npm run lint:fix`: Automatically fix linting issues
- `npm run typecheck`: Run TypeScript type checks
- `npm run test`: Run tests using Jest and React Testing Library

## File Organization

- `/app/chat`: The main chat interface
- `/components`: React components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and services
- `/public`: Static assets
- `/tests`: Test files
- `/types`: TypeScript type definitions
- `/examples`: Example deployment configurations
- `/charts`: Helm charts for Kubernetes deployment

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React hooks
- **Testing**: Jest and React Testing Library
- **Deployment**: Kubernetes/Docker

## Coding Standards and Patterns

### Naming Conventions

- React components: PascalCase
- Files containing React components: kebab-case
- Functions and variables: camelCase
- Constants: UPPER_SNAKE_CASE
- TypeScript interfaces: prefix with "I" (e.g., `IUserProps`)
- TypeScript types: PascalCase

### Hooks

- Custom hooks should be placed in the `/hooks` directory
- Hook names should start with "use" (e.g., `useMobile`)
- Hooks should be well-documented with TypeScript types

### API Interactions

- Use the provided API client in `/lib/api.ts` for backend calls
- Follow the OpenAPI specification in `openapi.yaml`
- API endpoints should be accessed through the inference-gateway SDK

### State Management

- Use React hooks for state management
- Context API for global state when necessary
- Prefer composition over deep component hierarchies

### Testing

- **Test Driven Development (TDD) is required for all feature implementations**
- Follow the Red-Green-Refactor TDD cycle:
  1. Write a failing test that defines the expected behavior
  2. Write the minimum code needed to make the test pass
  3. Refactor the code while keeping tests passing
- Every feature must have corresponding tests before being considered complete
- Write tests for all components and hooks
- Tests should be co-located with components in `/tests` directory
- Use React Testing Library for component testing
- Mock API calls in tests
- Aim for high test coverage, especially for critical application paths

### Deployment

- The application can be deployed using Docker or Kubernetes
- Kubernetes manifests are in `/examples/kubernetes`
- Helm charts are in `/charts/ui`

## Project-Specific Guidelines

- The UI connects to the Inference Gateway backend API for model inference
- Authentication providers are configured in `app/auth-providers.tsx`
- The chat interface is the main component for user interaction
- The UI supports multiple language models through model selectors

## Common Tasks

- Adding a new component: Create file in `/components`, add tests in `/tests/components`
- Adding a new page: Create file in `/app` directory following Next.js App Router conventions
- Modifying the chat interface: Update components in `/components/chat-*.tsx`
- API integration: Use the API client from `/lib/api.ts` and follow the OpenAPI spec
- Deployment: Use Docker or Kubernetes with provided configurations
