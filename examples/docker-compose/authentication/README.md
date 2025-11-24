# Authentication Docker Compose Example

This example demonstrates how to set up and use the Inference Gateway UI with
Authentication enabled using Docker Compose.

## Prerequisites

- Docker Engine 28.3.3-1+
- Docker Compose 2.39.1+
- Valid OAuth credentials from your provider(s)

## Setup Steps

1. Copy environment templates:

   ```bash
   cp .env.backend.example .env.backend
   cp .env.frontend.example .env.frontend
   ```

1. Configure backend environment (.env.backend) set the providers and storage
   type.

1. Configure frontend environment (.env.frontend):

   ```ini
   AUTH_ENABLE=true
   AUTH_SECURE_COOKIES=false # Set to true for HTTPS in production
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secure-random-salt
   NEXTAUTH_TRUST_HOST=true
   NEXTAUTH_REFRESH_TOKEN_ENABLED=true # Use refresh tokens when access expires

   # OIDC Configuration
   AUTH_OIDC_KEYCLOAK_CLIENT_ID=app-client
   AUTH_OIDC_KEYCLOAK_CLIENT_SECRET=very-secret
   AUTH_OIDC_KEYCLOAK_ISSUER=http://localhost:8080/realms/app-realm
   ```

1. Start the services:

   ```bash
   docker compose up -d
   ```

## Accessing the Application

- UI: `http://localhost:3000`

You will be redirected to the signin page for login. After successful login,
you will be redirected back to the application.

In this example keycloak is used as an Identity Provider (IdP) that supports OIDC.

**username: `user`**

**password: `password`**

**Check the ./keycloak/import/realm-config.json file for more details on how
to import the realm configuration into keycloak.**

**If you wish to add more identity providers, you can check the main README.md
for the environment variables.**

**Currently Keycloak, Google, and GitHub are supported.**

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
docker compose logs -f
```
