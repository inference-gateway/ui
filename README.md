<h1 align="center">Inference Gateway UI</h1>

<p align="center">
  <a href="https://github.com/inference-gateway/ui/actions/workflows/ci.yml">
    <img src="https://github.com/inference-gateway/ui/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://github.com/inference-gateway/ui/actions/workflows/release.yml">
    <img src="https://github.com/inference-gateway/ui/actions/workflows/release.yml/badge.svg" alt="Release Status">
  </a>
  <a href="https://github.com/inference-gateway/ui/actions/workflows/artifacts.yml">
    <img src="https://github.com/inference-gateway/ui/actions/workflows/artifacts.yml/badge.svg" alt="Artifacts Status">
  </a>
  <a href="https://github.com/inference-gateway/ui/releases/latest">
    <img src="https://img.shields.io/github/v/release/inference-gateway/ui?color=blue&style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/inference-gateway/ui/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/inference-gateway/ui?color=blue&style=flat-square" alt="License">
  </a>
</p>

The Inference Gateway UI is a Next.js application that provides a user-friendly interface to interact with AI models through the [Inference Gateway](https://github.com/inference-gateway/inference-gateway) service. It enables easy access to various language models through a consistent interface, streamlining the process of sending requests and receiving responses.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Key Features](#key-features)
- [Development](#development)
- [Configuration](#configuration)
  - [General Settings](#general-settings)
  - [Storage Settings](#storage-settings)
  - [Authentication Settings](#authentication-settings)
  - [Keycloak Auth Provider](#keycloak-auth-provider)
- [Docker](#docker)
- [Kubernetes Deployment](#kubernetes-deployment)
  - [Quick Installation](#quick-installation)
  - [Deployment Options](#deployment-options)
    - [1. Combined Deployment with Inference Gateway Backend](#1-combined-deployment-with-inference-gateway-backend)
    - [2. UI-Only Deployment (Connecting to External Gateway)](#2-ui-only-deployment-connecting-to-external-gateway)
    - [3. Deployment with Ingress for External Access](#3-deployment-with-ingress-for-external-access)
  - [Key Configuration Parameters](#key-configuration-parameters)
  - [Complete Example](#complete-example)
- [Deployment](#deployment)
- [Related Projects](#related-projects)
- [License](#license)
- [Contributing](#contributing)

## Key Features

- 🎨 **Modern Interface**: Clean, responsive design built with Next.js 15 and Tailwind CSS
- 🔌 **Seamless API Integration**: Connects directly to the Inference Gateway backend API
- 🛠️ **Model Selection**: Support for multiple language models through an intuitive model selector
- 💬 **Chat Interface**: Intuitive chat UI for interacting with AI models
- 🧰 **Tool Support**: Enables AI models to use tools, including web search capability
- 🔍 **Web Search**: Integrated web search functionality for models to retrieve current information
- 🔒 **Authentication**: Optional authentication using NextAuth.js
- 🛡️ **Rate Limiting**: Configurable rate limiting for public deployments and abuse prevention
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🐳 **Docker Support**: Easy containerization and deployment
- ☸️ **Kubernetes Ready**: Includes configurations for Kubernetes deployment
- 🧩 **Component Library**: Built with shadcn/ui components and Radix UI primitives
- 🔄 **State Management**: Efficient state management with React hooks

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The development server will be available at http://localhost:3000.

## Configuration

The UI can be configured using the following environment variables:

### General Settings

| Environment Variable  | Default Value           | Description                      |
| --------------------- | ----------------------- | -------------------------------- |
| NODE_ENV              | `development`           | Node environment                 |
| PORT                  | `3000`                  | Port to run the application on   |
| HOSTNAME              | `0.0.0.0`               | Hostname to bind to              |
| INFERENCE_GATEWAY_URL | `http://localhost:8080` | URL of the Inference Gateway API |
| LOG_LEVEL             | `debug`                 | Server-side logging level        |
| NEXT_PUBLIC_LOG_LEVEL | `debug`                 | Client-side logging level        |

### Rate Limiting Settings

| Environment Variable    | Default Value | Description                                               |
| ----------------------- | ------------- | --------------------------------------------------------- |
| ENABLE_RATE_LIMITING    | `false`       | Enable rate limiting for all API endpoints                |
| RATE_LIMIT_WINDOW_MS    | `60000`       | Time window in milliseconds (default: 1 minute)           |
| RATE_LIMIT_MAX_REQUESTS | `60`          | Maximum requests per window (default: 60 requests/minute) |

**Rate Limiting Configuration:**

Rate limiting can be enabled for public deployments to prevent abuse. When enabled, it applies to all API endpoints and tracks requests by client IP address (using `x-forwarded-for` or `x-real-ip` headers when available).

Example configurations:

- **Development**: Rate limiting disabled (default)
- **Public playground**: 30 requests per minute
  ```
  ENABLE_RATE_LIMITING=true
  RATE_LIMIT_WINDOW_MS=60000
  RATE_LIMIT_MAX_REQUESTS=30
  ```
- **Production**: 100 requests per minute
  ```
  ENABLE_RATE_LIMITING=true
  RATE_LIMIT_WINDOW_MS=60000
  RATE_LIMIT_MAX_REQUESTS=100
  ```

When rate limits are exceeded, clients receive a `429 Too Many Requests` response with appropriate headers indicating when they can retry.

### Storage Settings

| Environment Variable | Default Value | Description                                             |
| -------------------- | ------------- | ------------------------------------------------------- |
| STORAGE_TYPE         | `local`       | Storage type for chat history                           |
| DB_CONNECTION_URL    | -             | Connection URL for the database (required for postgres) |

Examples:

- **Local storage** (default): No connection URL needed
- **PostgreSQL**: `postgresql://username:password@host:port/database`

### Authentication Settings

| Environment Variable           | Default Value           | Description                                |
| ------------------------------ | ----------------------- | ------------------------------------------ |
| ENABLE_AUTH                    | `false`                 | Enable authentication                      |
| SECURE_COOKIES                 | `false`                 | Use secure cookies (set to true for HTTPS) |
| NEXTAUTH_URL                   | `http://localhost:3000` | URL of this application (for NextAuth)     |
| NEXTAUTH_SECRET                | -                       | Secret used to encrypt session cookies     |
| NEXTAUTH_TRUST_HOST            | `true`                  | Trust the host header from the proxy       |
| NEXTAUTH_REFRESH_TOKEN_ENABLED | `true`                  | Enable refresh token rotation              |

### Keycloak Auth Provider

| Environment Variable | Default Value                            | Description            |
| -------------------- | ---------------------------------------- | ---------------------- |
| KEYCLOAK_ID          | `app-client`                             | Keycloak client ID     |
| KEYCLOAK_SECRET      | -                                        | Keycloak client secret |
| KEYCLOAK_ISSUER      | `http://localhost:8080/realms/app-realm` | Keycloak issuer URL    |

## Docker

Pre-built container images are available on the GitHub Container Registry. You can use these images directly:

```bash
# Pull the pre-built image
docker pull ghcr.io/inference-gateway/ui:latest

# Run the container with the pre-built image
docker run -p 3000:3000 \
  -e INFERENCE_GATEWAY_URL=http://localhost:8080 \
  ghcr.io/inference-gateway/ui:latest
```

Alternatively, you can build the image locally:

```bash
# Build the Docker image locally
docker build -t inference-gateway-ui --target dev .

# Run the container with the locally built image
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -e INFERENCE_GATEWAY_URL=http://localhost:8080 \
  inference-gateway-ui
```

## Kubernetes Deployment

The Inference Gateway UI provides a Helm chart for easy deployment to Kubernetes environments. The chart is available as an OCI artifact, which can be deployed directly without adding a Helm repository.

### Quick Installation

```bash
helm upgrade --install inference-gateway-ui \
  oci://ghcr.io/inference-gateway/charts/inference-gateway-ui \
  --version 0.7.1 \
  --create-namespace \
  --namespace inference-gateway \
  --set gateway.enabled=true \
  --set gateway.envFrom.secretRef=inference-gateway
```

### Deployment Options

The Helm chart supports multiple deployment scenarios:

#### 1. Combined Deployment with Inference Gateway Backend

Deploy the UI with the Inference Gateway backend as a dependency (recommended):

```bash
helm upgrade --install inference-gateway-ui \
  oci://ghcr.io/inference-gateway/charts/inference-gateway-ui \
  --create-namespace \
  --namespace inference-gateway \
  --set gateway.enabled=true \
  --set gateway.envFrom.secretRef=inference-gateway
```

#### 2. UI-Only Deployment (Connecting to External Gateway)

Deploy the UI separately and connect it to an existing Inference Gateway instance:

```bash
helm upgrade --install inference-gateway-ui \
  oci://ghcr.io/inference-gateway/charts/inference-gateway-ui \
  --create-namespace \
  --namespace inference-gateway \
  --set gateway.enabled=false \
  --set-string "env[0].name=INFERENCE_GATEWAY_URL" \
  --set-string "env[0].value=http://your-gateway-service:8080"
```

#### 3. Deployment with Ingress for External Access

Enable ingress for accessing the UI from outside the cluster:

```bash
helm upgrade --install inference-gateway-ui \
  oci://ghcr.io/inference-gateway/charts/inference-gateway-ui \
  --create-namespace \
  --namespace inference-gateway \
  --set gateway.enabled=true \
  --set gateway.envFrom.secretRef=inference-gateway \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set "ingress.hosts[0].host=ui.inference-gateway.local" \
  --set "ingress.hosts[0].paths[0].path=/" \
  --set "ingress.hosts[0].paths[0].pathType=Prefix" \
  --set "ingress.tls[0].secretName=inference-gateway-ui-tls" \
  --set "ingress.tls[0].hosts[0]=ui.inference-gateway.local"
```

### Key Configuration Parameters

| Parameter           | Description                                                            | Default                        |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `replicaCount`      | Number of UI replicas to deploy                                        | `1`                            |
| `image.repository`  | UI container image repository                                          | `ghcr.io/inference-gateway/ui` |
| `image.tag`         | UI container image tag (defaults to chart appVersion if not specified) | `""`                           |
| `gateway.enabled`   | Deploy the Inference Gateway backend with the UI                       | `true`                         |
| `ingress.enabled`   | Enable ingress for external access                                     | `false`                        |
| `ingress.className` | Ingress controller class to use                                        | `nginx`                        |
| `resources`         | CPU/Memory resource limits and requests                                | See values.yaml                |
| `config.*`          | Environment variables for the UI configuration                         | See values.yaml                |

### Complete Example

For a complete example including a local Kubernetes setup with k3d, ingress configuration, and more, refer to the [Kubernetes example directory](./examples/kubernetes/).

```bash
# Example with comprehensive configuration
helm upgrade --install inference-gateway-ui \
  oci://ghcr.io/inference-gateway/charts/inference-gateway-ui \
  --version 0.7.1 \
  --create-namespace \
  --namespace inference-gateway \
  --set replicaCount=1 \
  --set gateway.enabled=true \
  --set gateway.envFrom.secretRef=inference-gateway \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=100m \
  --set resources.requests.memory=128Mi \
  --set-string "env[0].name=NODE_ENV" \
  --set-string "env[0].value=production" \
  --set-string "env[1].name=NEXT_TELEMETRY_DISABLED" \
  --set-string "env[1].value=1"
```

## Deployment

The application is automatically packaged as a Docker image and published to GitHub Container Registry (ghcr.io) when a new release is created.

To pull the latest release:

```bash
docker pull ghcr.io/inference-gateway/ui:latest
```

## Related Projects

- [Inference Gateway](https://github.com/inference-gateway/inference-gateway) - The main gateway service
- [Documentation](https://docs.inference-gateway.com) - Project documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started, coding standards, development workflow, and more.
