<h1 align="center">User Interface (UI)</h1>

<p align="center">
  <a href="https://github.com/inference-gateway/ui/actions/workflows/ci.yml">
    <img src="https://github.com/inference-gateway/ui/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
</p>

The UI for the inference-gateway, providing a user-friendly interface to interact with and visualize inference results and manage models.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Docker

This application can be containerized using Docker:

```bash
# Build the Docker image locally
docker build -t inference-gateway-ui .

# Run the container
docker run -p 3000:3000 inference-gateway-ui
```

## Deployment

The application is automatically packaged as a Docker image and published to GitHub Container Registry (ghcr.io) when a new release is created.

To pull the latest release:

```bash
docker pull ghcr.io/inference-gateway/ui:latest
```
