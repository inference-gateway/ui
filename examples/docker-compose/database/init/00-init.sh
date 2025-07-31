#!/bin/bash
set -e

# Database initialization script for Inference Gateway UI
# This script runs during PostgreSQL container startup

echo "🚀 Starting database initialization for Inference Gateway UI..."

# Create the database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    SELECT 'CREATE DATABASE $POSTGRES_DB'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\gexec
EOSQL

echo "📊 Database '$POSTGRES_DB' is ready"

# Switch to the application database
export PGDATABASE="$POSTGRES_DB"

echo "🔧 Running schema initialization..."

# Run the main schema file
if [ -f "/docker-entrypoint-initdb.d/01-schema.sql" ]; then
    echo "📝 Applying schema from 01-schema.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "/docker-entrypoint-initdb.d/01-schema.sql"
else
    echo "⚠️  Schema file not found, running individual migrations..."
    
    # Run migrations in order if schema file doesn't exist
    for migration in /docker-entrypoint-initdb.d/migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "📝 Applying migration: $(basename "$migration")"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration"
        fi
    done
fi

echo "🌱 Running seed data..."

# Run seed files
for seed in /docker-entrypoint-initdb.d/seeds/*.sql; do
    if [ -f "$seed" ]; then
        echo "🌱 Applying seed: $(basename "$seed")"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$seed"
    fi
done

echo "✅ Database initialization completed successfully!"
