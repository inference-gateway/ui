# PostgreSQL Storage Example

This example demonstrates how to set up and use the Inference Gateway UI with PostgreSQL storage backend using Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Overview

This setup includes:

- Inference Gateway UI with PostgreSQL storage enabled
- Inference Gateway backend
- PostgreSQL database with automatic schema initialization
- Persistent data storage

## Getting Started

1. Copy the `.env.backend.example` file to `.env.backend` and update the environment variables as needed:

   ```sh
   cp .env.backend.example .env.backend
   ```

2. Copy the `.env.frontend.example` file to `.env.frontend` and update the environment variables as needed:

   ```sh
   cp .env.frontend.example .env.frontend
   ```

3. Start the application using Docker Compose:

   ```sh
   docker-compose up
   ```

4. The database will be automatically initialized with the required schema on first startup.

5. Open your web browser and navigate to `http://localhost:3000` to see the UI in action.

## Configuration

### Frontend Environment Variables

The `.env.frontend` file should include:

```env
# Enable PostgreSQL storage
STORAGE_TYPE=postgres

# Database connection
DB_CONNECTION_URL=postgresql://postgres:password@postgres:5432/inference_gateway

# Database connection pool configuration (optional)
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# Other UI configuration
INFERENCE_GATEWAY_URL=http://inference-gateway:8080
ENABLE_AUTH=false
```

### Backend Environment Variables

Configure your `.env.backend` file as needed for the Inference Gateway backend.

## Database Schema

The PostgreSQL schema includes:

- `chat_sessions` - Stores chat sessions with metadata and token usage
- `messages` - Stores individual messages within chat sessions
- `user_preferences` - Stores user preferences including active chat and selected model

The schema is automatically created when the database starts using the migration files in the `migrations/` directory.

## Data Persistence

Chat data is persisted in the PostgreSQL database and will survive container restarts. The database data is stored in a Docker volume named `postgres_data`.

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Ensure the PostgreSQL container is healthy: `docker-compose ps`
2. Check the database logs: `docker-compose logs postgres`
3. Verify the `DB_CONNECTION_URL` in your `.env.frontend` file matches the database configuration

### Schema Issues

If you need to reset the database schema:

1. Stop the containers: `docker-compose down`
2. Remove the database volume: `docker volume rm postgres_postgres_data`
3. Restart: `docker-compose up`

## Security Considerations

### Production Deployment

For production deployments, consider the following security enhancements:

#### SSL/TLS Configuration

Enable SSL connections by updating your `DB_CONNECTION_URL`:

```env
# Enable SSL connection (production)
DB_CONNECTION_URL=postgresql://postgres:password@postgres:5432/inference_gateway?sslmode=require

# For self-signed certificates (development only)
DB_CONNECTION_URL=postgresql://postgres:password@postgres:5432/inference_gateway?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem
```

#### Database Authentication

- Use strong passwords for database users
- Create dedicated database users with minimal required permissions
- Consider using certificate-based authentication for production

#### Connection Pool Security

- Set appropriate `DB_POOL_SIZE` limits to prevent resource exhaustion
- Configure timeouts to prevent connection hanging
- Monitor connection pool metrics in production

#### SQL Injection Protection

The PostgreSQL storage service uses prepared statements for all database operations:

- All queries use parameterized statements via the `pg` driver
- Automatic SQL injection prevention through proper parameter binding
- No need for manual input validation as the database handles type safety

### Environment Variables Reference

| Variable                | Default | Description                            |
| ----------------------- | ------- | -------------------------------------- |
| `DB_POOL_SIZE`          | `10`    | Maximum number of database connections |
| `DB_IDLE_TIMEOUT`       | `30000` | Idle connection timeout (ms)           |
| `DB_CONNECTION_TIMEOUT` | `2000`  | Connection establishment timeout (ms)  |

## Manual Database Access

To connect to the PostgreSQL database directly:

```sh
docker-compose exec postgres psql -U postgres -d inference_gateway
```
