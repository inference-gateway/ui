# Authentication Docker Compose Example

This example demonstrates how to set up and use the Inference Gateway UI with Authentication enabled using Docker Compose.

## Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+
- Valid OAuth credentials from your provider(s)

## Setup Steps

1. Copy environment templates:

```bash
cp .env.backend.example .env.backend
cp .env.frontend.example .env.frontend
```

2. Configure backend environment (.env.backend):

```ini
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

3. Configure frontend environment (.env.frontend):

```ini
AUTH_ENABLED="true"
```

4. Start the services:

```bash
docker compose -f examples/docker-compose/authentication/docker-compose.yaml up -d
```

## Accessing the Application

- UI: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Configuration Notes

- Add additional OAuth providers by following the NextAuth.js documentation
- For production deployments:
  - Set `NEXTAUTH_URL` to your public domain
  - Enable HTTPS
  - Use proper secret management
  - Configure session storage

## Troubleshooting

View container logs:

```bash
docker compose -f examples/docker-compose/authentication/docker-compose.yaml logs -f
```
