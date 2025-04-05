# Basic Docker Compose Example

This example demonstrates how to set up and use the Inference Gateway UI using Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Getting Started

1. Copy the `.env.backend.example` file to `.env.backend` and update the environment variables as needed. This file contains configuration settings for the backend service.

   ```sh
   cp .env.backend.example .env.backend
   ```

2. Copy the `.env.frontend.example` file to `.env.frontend` and update the environment variables as needed. This file contains configuration settings for the frontend service.

   ```sh
   cp .env.frontend.example .env.frontend
   ```

3. Start the application using Docker Compose:

   ```sh
   docker-compose up
   ```

4. Open your web browser and navigate to `http://localhost:3000` to see the UI in action.
