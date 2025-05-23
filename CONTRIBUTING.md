# Contributing to Inference Gateway UI

Thank you for your interest in contributing to Inference Gateway UI! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Writing Tests](#writing-tests)
- [Coding Standards](#coding-standards)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [React Best Practices](#react-best-practices)
  - [Styling](#styling)
- [Documentation](#documentation)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

We expect all contributors to adhere to our code of conduct. Please be respectful, inclusive, and considerate when interacting with other contributors.

## Getting Started

### Development Environment

1. **Fork and clone the repository**:

   ```bash
   git clone https://github.com/your-username/ui.git
   cd ui
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

### Project Structure

The project follows Next.js 15 App Router structure:

- `/app`: Next.js pages and layouts
- `/components`: React components
- `/components/ui`: shadcn/ui components
- `/hooks`: Custom React hooks
- `/lib`: Utilities and services
- `/public`: Static assets
- `/tests`: Test files
- `/types`: TypeScript types

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch for integration
- Feature branches: `feature/your-feature-name`
- Bugfix branches: `bugfix/issue-name`

Always create your feature/bugfix branch from `develop`.

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or tools

### Pull Requests

1. Update your feature branch with the latest changes from `develop`
2. Ensure all tests pass
3. Submit a PR to merge into `develop`
4. Provide a clear description of the changes
5. Link related issues
6. Wait for review and address feedback

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- We follow Test-Driven Development (TDD)
- Write tests for all components and hooks
- Co-locate tests with components in `/tests` directory
- Use React Testing Library for component testing
- Mock API calls in tests

## Coding Standards

### TypeScript Guidelines

- Use TypeScript interfaces for props
- Prefer explicit typing over `any`
- Use early returns to reduce nesting
- Use async/await instead of promises

### React Best Practices

- Use functional components
- Use proper prop validation
- Follow React hooks best practices
- Avoid prop drilling (use composition)

### Styling

- Use Tailwind CSS for styling
- Use class-variance-authority (cva) for component variants
- Follow the design system established by shadcn/ui

## Documentation

- Update documentation when adding/changing features
- Add JSDoc comments to functions and components
- Keep the README updated

## Release Process

1. Changes are merged into `develop`
2. QA verification is performed
3. `develop` is merged into `main`
4. A new tag is created using semantic versioning
5. GitHub Actions build and publish the release

## Getting Help

If you need help, please:

- Check existing [issues](https://github.com/inference-gateway/ui/issues)
- Join our community discussions
- Reach out to maintainers

Thank you for contributing to Inference Gateway UI!
