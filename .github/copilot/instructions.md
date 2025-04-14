# GitHub Copilot Instructions for Inference Gateway UI

## Project Overview
This is a Next.js application serving as the UI for the Inference Gateway project. It enables interacting with AI models through a consistent interface. The UI connects to a backend API service for model inference.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI with shadcn/ui component system
- **Authentication**: NextAuth.js
- **State Management**: React hooks
- **Testing**: Jest and React Testing Library
- **Deployment**: Kubernetes/Docker

## Coding Standards and Patterns

### Component Structure
- Components should be functional components with TypeScript interfaces for props
- Use the shadcn/ui component system for new UI components
- Place components in the `/components` directory
- For component variants, use Tailwind's class-variance-authority (cva)

### Naming Conventions
- React components: PascalCase
- Files containing React components: kebab-case
- Functions and variables: camelCase
- Constants: UPPER_SNAKE_CASE
- TypeScript interfaces: prefix with "I" (e.g., `IUserProps`)
- TypeScript types: PascalCase

### Hooks
- Custom hooks should be placed in the `/hooks` directory
- Hook names should start with "use" (e.g., `useChat`)
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
- Write tests for all components and hooks
- Tests should be co-located with components in `/tests` directory
- Use React Testing Library for component testing
- Mock API calls in tests

### Deployment
- The application can be deployed using Docker or Kubernetes
- Kubernetes manifests are in `/examples/kubernetes`
- Helm charts are in `/charts/ui`

## Project-Specific Guidelines
- The UI connects to the Inference Gateway backend API for model inference
- Authentication providers are configured in `app/auth-providers.tsx`
- The chat interface is the main component for user interaction
- The UI supports multiple language models through model selectors

## File Organization
- `/app`: Next.js App Router pages and layouts
- `/components`: React components
- `/components/ui`: shadcn/ui components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and services
- `/public`: Static assets
- `/tests`: Test files
- `/types`: TypeScript type definitions
- `/examples`: Example deployment configurations
- `/charts`: Helm charts for Kubernetes deployment

## Common Tasks
- Adding a new component: Create file in `/components`, add tests in `/tests/components`
- Adding a new page: Create file in `/app` directory following Next.js App Router conventions
- Modifying the chat interface: Update components in `/components/chat-*.tsx`
- API integration: Use the API client from `/lib/api.ts` and follow the OpenAPI spec
- Deployment: Use Docker or Kubernetes with provided configurations
