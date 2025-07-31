# PostgreSQL Storage for Conversation History

This document describes the PostgreSQL storage backend implementation for the Inference Gateway UI, which allows storing chat sessions and conversation history in a PostgreSQL database instead of local browser storage.

## Overview

The PostgreSQL storage backend provides:
- Persistent storage of chat sessions across browser sessions
- Multi-user support with user-specific data isolation
- Proper database transactions and error handling
- Token usage tracking at the session level
- Support for all message types including tool calls

## Configuration

### Environment Variables

Set the following environment variables to enable PostgreSQL storage:

```bash
# Storage configuration
STORAGE_TYPE=postgres
STORAGE_CONNECTION_URL=postgresql://username:password@host:port/database
```

### Example Configuration

```bash
# Local development
STORAGE_TYPE=postgres
STORAGE_CONNECTION_URL=postgresql://postgres:password@localhost:5432/inference_gateway_ui

# Production
STORAGE_TYPE=postgres
STORAGE_CONNECTION_URL=postgresql://user:pass@pg-host.example.com:5432/inference_ui
```

## Database Schema

The PostgreSQL storage uses three main tables:

### 1. `chat_sessions` Table

Stores chat session metadata and token usage:

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Token usage tracking
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0
);
```

### 2. `messages` Table

Stores individual messages within chat sessions:

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT,
    model VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional message fields from inference gateway SDK
    tool_calls JSONB,
    tool_call_id VARCHAR(255),
    name VARCHAR(255)
);
```

### 3. `user_preferences` Table

Stores user preferences like active chat and selected model:

```sql
CREATE TABLE user_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    active_chat_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    selected_model VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Database Setup

### 1. Install PostgreSQL

Install PostgreSQL on your system or use a hosted solution like AWS RDS, Google Cloud SQL, or Azure Database for PostgreSQL.

### 2. Create Database

```sql
CREATE DATABASE inference_gateway_ui;
CREATE USER inference_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inference_gateway_ui TO inference_user;
```

### 3. Run Migration

Execute the migration script to create the required tables:

```bash
psql -h localhost -U inference_user -d inference_gateway_ui -f examples/docker-compose/postgres/migrations/001_create_chat_tables.sql
```

### 4. Quick Start with Docker Compose

For a complete setup with Docker Compose, see the [PostgreSQL example](../examples/docker-compose/postgres/README.md) which includes:
- Automatic database initialization
- Pre-configured environment variables
- Full Docker Compose setup with UI, backend, and database

## Features

### Multi-User Support

Each user's data is isolated using the `user_id` field. When authentication is enabled, the user ID from the session is automatically used to filter data.

```typescript
// Example: Creating storage service with user ID
const storageService = StorageServiceFactory.createService({
  storageType: StorageType.POSTGRES,
  userId: session?.user?.id,
  connectionUrl: process.env.STORAGE_CONNECTION_URL,
});
```

### Automatic Fallback

The system automatically falls back to local storage if:
- PostgreSQL connection URL is not provided
- Database connection fails
- PostgreSQL service initialization throws an error

### Transaction Support

All database operations use transactions to ensure data consistency:

```typescript
// Example from saveChatSessions method
await client.query('BEGIN');
try {
  // Delete existing sessions
  await client.query('DELETE FROM chat_sessions WHERE user_id = $1', [userId]);
  
  // Insert new sessions and messages
  // ... multiple INSERT operations
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

## API Integration

The storage configuration is automatically fetched by the frontend from `/api/v1/storage/config`:

```typescript
// Frontend automatically detects and uses PostgreSQL storage
const { config } = useStorageConfig();
const storageService = useMemo(() => {
  return StorageServiceFactory.createService({
    storageType: config.type,
    userId: session?.user?.id,
    connectionUrl: config.connectionUrl,
  });
}, [config, session?.user?.id]);
```

## Error Handling

The PostgreSQL storage service includes comprehensive error handling:

- **Connection errors**: Automatically fall back to local storage
- **Query errors**: Roll back transactions and log detailed error information
- **Type conversion errors**: Handle missing or invalid data gracefully
- **Network timeouts**: Configurable connection and idle timeouts

## Performance Considerations

### Connection Pooling

The service uses pg connection pooling with sensible defaults:

```typescript
this.pool = new Pool({
  connectionString: options.connectionUrl,
  max: 10,                    // Maximum number of connections
  idleTimeoutMillis: 30000,   // 30 second idle timeout
  connectionTimeoutMillis: 2000, // 2 second connection timeout
});
```

### Indexing

The migration includes indexes for commonly queried fields:

```sql
-- Indexes for faster queries
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_user_preferences_active_chat_id ON user_preferences(active_chat_id);
```

### JSONB for Tool Calls

Tool calls are stored as JSONB for efficient querying and storage:

```sql
-- Efficient storage and querying of tool calls
tool_calls JSONB,

-- Example query for messages with specific tool calls
SELECT * FROM messages WHERE tool_calls @> '[{"type": "function"}]';
```

## Testing

The PostgreSQL storage service includes comprehensive unit tests:

```bash
# Run PostgreSQL storage tests
npm test -- tests/lib/storage-postgres.test.ts
```

Tests cover:
- Connection handling and error scenarios
- CRUD operations for all data types
- Transaction rollback on errors
- Type conversion and data validation
- Multi-user data isolation

## Migration from Local Storage

When switching from local to PostgreSQL storage:

1. **Existing data**: Local storage data is not automatically migrated
2. **Gradual rollout**: Users can be migrated gradually by updating `STORAGE_TYPE`
3. **Data export**: Consider implementing export functionality for local storage data

## Monitoring and Logging

The service includes detailed logging for:

- Connection establishment and errors
- Query execution and performance
- Data validation issues
- User activity and session management

Example log output:

```json
{
  "level": "debug",
  "message": "PostgreSQL storage service initialized",
  "userId": "user-123",
  "hasConnectionUrl": true
}

{
  "level": "debug", 
  "message": "Loaded chat sessions from PostgreSQL",
  "userId": "user-123",
  "count": 5
}
```

## Security Considerations

- **SQL Injection**: All queries use parameterized statements
- **User Isolation**: Data is properly filtered by user ID
- **Connection Security**: Use SSL/TLS for database connections in production
- **Access Control**: Database users should have minimal required permissions

## Troubleshooting

### Common Issues

1. **Connection refused**: Check PostgreSQL is running and accessible
2. **Authentication failed**: Verify database credentials
3. **Tables not found**: Run the migration script
4. **Permission denied**: Ensure database user has required permissions

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
LOG_LEVEL=debug npm run dev
```

### Health Checks

The application includes health check endpoints that can verify database connectivity:

```bash
curl http://localhost:3000/api/health
```

## Future Enhancements

Potential improvements for the PostgreSQL storage:

1. **Data archiving**: Automatic archiving of old conversations
2. **Full-text search**: PostgreSQL full-text search for conversations
3. **Analytics**: Query patterns and usage analytics
4. **Backup integration**: Automated backup and restore procedures
5. **Read replicas**: Support for read-only replicas for scaling

## Contributing

When contributing to the PostgreSQL storage implementation:

1. **Tests**: Add tests for new functionality
2. **Migration**: Update migration scripts for schema changes
3. **Documentation**: Update this documentation for changes
4. **Backwards compatibility**: Consider impact on existing deployments