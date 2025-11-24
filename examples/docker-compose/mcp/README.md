# Docker Compose Example with MCP Server

This example demonstrates how to set up and use the Inference Gateway UI with
an integrated Model Context Protocol (MCP) server using Docker Compose.

## What's Included

- **MCP Filesystem Server**: A TypeScript-based HTTP MCP server that provides
  file system operations following the Inference Gateway TypeScript SDK v0.7.3
  patterns
- **Inference Gateway Backend**: The backend API service
- **Inference Gateway UI**: The main chat interface

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## MCP Server Features

The included TypeScript MCP server provides the following 8 tools:

- **read_file**: Read content from a file
- **write_file**: Write content to a file (supports overwrite or append mode)
- **list_directory**: List the contents of a directory (supports recursive listing)
- **create_directory**: Create a new directory
- **delete_directory**: Delete a directory
- **delete_file**: Delete a file
- **file_exists**: Check if a file or directory exists
- **get_file_info**: Get detailed information about a file or directory
  (size, permissions, modification time, etc.)

All file operations are restricted to a sandboxed `/tmp/mcp-files` directory
for security.

## Getting Started

1. Copy the `.env.backend.example` file to `.env.backend` and update the
   environment variables as needed. This file contains configuration settings
   for the backend service.

   ```sh
   cp .env.backend.example .env.backend
   ```

   **Note**: MCP is already enabled in the example configuration with the
   server URL set to `http://mcp-filesystem-server:3001/mcp`.

2. Copy the `.env.frontend.example` file to `.env.frontend` and update the
   environment variables as needed. This file contains configuration settings
   for the frontend service.

   ```sh
   cp .env.frontend.example .env.frontend
   ```

3. Start the application using Docker Compose:

   ```sh
   docker-compose up
   ```

   This will start three services:

   - MCP Filesystem Server on port 3001 (internal)
   - Inference Gateway Backend (internal)
   - UI on port 3000

4. Open your web browser and navigate to `http://localhost:3000` to see the UI
   in action.

You should see at the bottom Tools and that 8 tools are available, if you
click it you can see more details about each tool.

## Using MCP Tools

Once the services are running, you can use MCP tools in your conversations:

1. In the chat interface, click on the "MCP Tools" button to see available tools
2. The MCP filesystem server provides tools for file operations
3. Example usage in chat:
   - Ask the AI to "create a new directory named examples with hello.txt"
   - Ask the AI to "list the files in the examples directory"
   - Request to "read the contents of examples/hello.txt"
   - Ask to "create a new file with some content"

You have to verify that the LLM you are using supports the MCP tools. You will
see an error in the logs indicating that the LLM selected does not support
Tools.

## MCP Server Details

The example demonstrate a simple MCP filesystem server.

### API Endpoints

- `GET /health` - Health check endpoint
- `POST /mcp` - MCP protocol endpoint for tool calls

### Sample Files

The MCP server creates a sandboxed directory `/tmp/mcp-files` for all file
operations. You can mount additional data by modifying the volume mapping in
`docker-compose.yaml`.

## Troubleshooting

### MCP Tools Not Available

If MCP tools are not showing up in the UI:

1. Check that MCP is enabled in `.env.backend`:

   ```text
   MCP_ENABLE=true
   MCP_EXPOSE=true
   MCP_SERVERS=http://mcp-filesystem-server:3001/mcp
   ```

2. Verify the MCP server is running:

   ```sh
   docker-compose ps
   ```

3. Check the logs:

   ```sh
   docker-compose logs mcp-filesystem-server
   docker-compose logs inference-gateway
   ```

### Container Issues

If containers fail to start:

1. Check Docker logs:

   ```sh
   docker-compose logs
   ```

2. Rebuild containers:

   ```sh
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```
