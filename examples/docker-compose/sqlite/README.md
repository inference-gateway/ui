# SQLite Storage Example

This example demonstrates how to set up and use the Inference Gateway UI with SQLite storage backend using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Basic understanding of Docker Compose

## Overview

This setup includes:

- Inference Gateway UI with SQLite storage enabled
- Inference Gateway backend
- SQLite database with automatic schema initialization
- Persistent data storage via Docker volumes

## Getting Started

1. **Copy the environment files:**

```bash
cp .env.frontend.example .env.frontend
```

2. **Configure the environment variables:**

The `.env.frontend` file should include:

```env
# Enable SQLite storage
STORAGE_TYPE=sqlite

# Database connection (SQLite file path)
DB_CONNECTION_URL=sqlite:/data/chat_history.db
```

3. **Start the services:**

```bash
docker-compose up -d
```

4. **Access the application:**

Open your browser and navigate to `http://localhost:3000`

## Configuration

### Storage Configuration

The SQLite storage provider supports multiple connection URL formats:

```env
# File-based storage (recommended for persistence)
DB_CONNECTION_URL=sqlite:/data/chat_history.db

# Alternative file formats
DB_CONNECTION_URL=sqlite:./data/chat_history.db
DB_CONNECTION_URL=file:/data/chat_history.db

# In-memory database (data will be lost on restart)
DB_CONNECTION_URL=sqlite::memory:
```

### Environment Variables

Key environment variables for SQLite storage:

```env
# Storage type (required)
STORAGE_TYPE=sqlite

# Database connection URL (required)
DB_CONNECTION_URL=sqlite:/data/chat_history.db

# Logging level (optional)
LOG_LEVEL=debug
```

## Data Persistence

Chat data is persisted in the SQLite database file and will survive container restarts. The database file is stored in a Docker volume to ensure data persistence.

## SQLite Connection URLs

The SQLite storage provider supports several URL formats:

| Format | Example | Description |
|--------|---------|-------------|
| `sqlite:` | `sqlite:./database.db` | Relative file path |
| `sqlite://` | `sqlite://./database.db` | Relative file path with protocol |
| `file:` | `file:./database.db` | File URI format |
| `sqlite::memory:` | `sqlite::memory:` | In-memory database |

## Features

### Automatic Schema Management

The SQLite storage provider automatically:

- Creates required tables (`chat_sessions`, `messages`, `user_preferences`)
- Sets up proper indexes for optimal performance
- Enables foreign key constraints
- Manages database schema migrations

### Performance Optimizations

- Database indexes on frequently queried columns
- Transaction-based operations for data consistency
- Connection pooling (single connection per instance)
- Prepared statements for SQL injection prevention

## Troubleshooting

### Connection Issues

If you encounter database connection errors:

1. Ensure the database directory exists and is writable
2. Check the `DB_CONNECTION_URL` format in your `.env.frontend` file
3. Verify file permissions for the database file location

### Database File Issues

If the database file becomes corrupted or needs to be reset:

1. Stop the containers: `docker-compose down`
2. Remove the database volume: `docker volume rm sqlite_data`
3. Restart: `docker-compose up`

### Permission Issues

For file permission problems:

```bash
# Check container logs
docker-compose logs ui

# Ensure the data directory is writable
chmod 755 /path/to/data/directory
```

## Security Considerations

### File Permissions

- Ensure the SQLite database file has appropriate permissions
- Store database files in secure locations
- Regular backups of the database file

### SQL Injection Protection

The SQLite storage service uses prepared statements for all database operations:

- All queries use parameterized statements via the `sqlite3` driver
- Automatic SQL injection prevention through proper parameter binding
- Input validation and sanitization

### Data Encryption

For sensitive data, consider:

- File system-level encryption for the database file
- SQLite extensions for encryption (requires additional configuration)
- Network-level security for the application

## Backup and Recovery

### Creating Backups

```bash
# Copy the database file
docker-compose exec ui cp /data/chat_history.db /data/backup_$(date +%Y%m%d_%H%M%S).db

# Or from host system
docker cp container_name:/data/chat_history.db ./backup_$(date +%Y%m%d_%H%M%S).db
```

### Restoring from Backup

```bash
# Stop the application
docker-compose down

# Replace the database file
cp backup_file.db ./data/chat_history.db

# Restart the application
docker-compose up -d
```

## Comparison with Other Storage Options

| Feature | SQLite | PostgreSQL | Local Storage |
|---------|--------|------------|---------------|
| Setup Complexity | Low | Medium | Minimal |
| Scalability | Single user/low volume | High volume | Browser only |
| Persistence | File-based | Server-based | Browser only |
| Backup | File copy | SQL dump | Manual export |
| Multi-user | Limited | Excellent | Per browser |
| Performance | Good for small datasets | Excellent | Fast |

## Advanced Configuration

### Custom Database Location

```env
# Mount custom path
DB_CONNECTION_URL=sqlite:/custom/path/database.db
```

### Multiple Databases

For development or testing, you can use different database files:

```env
# Development
DB_CONNECTION_URL=sqlite:/data/dev_chat_history.db

# Testing
DB_CONNECTION_URL=sqlite:/data/test_chat_history.db

# Production
DB_CONNECTION_URL=sqlite:/data/prod_chat_history.db
```

## Monitoring

### Database Size

```bash
# Check database file size
docker-compose exec ui ls -lh /data/chat_history.db

# Check database statistics
docker-compose exec ui sqlite3 /data/chat_history.db "PRAGMA database_list;"
```

### Performance Monitoring

```bash
# Check query performance
docker-compose exec ui sqlite3 /data/chat_history.db "EXPLAIN QUERY PLAN SELECT * FROM chat_sessions;"
```

For production environments, consider monitoring:

- Database file size growth
- Query performance
- Disk I/O usage
- Application response times