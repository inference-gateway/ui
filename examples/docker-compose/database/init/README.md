# Database Schema and Migrations

This directory contains the database schema and migration files for the Inference Gateway UI.

## Structure

- `migrations/`: Database migration files
- `seeds/`: Database seed files for development/testing
- `schema.sql`: Complete database schema

## Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the schema from `schema.sql` in your Supabase SQL editor
4. Configure your environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Migration Strategy

For future schema changes, create numbered migration files in the `migrations/` directory:

- `001_initial_schema.sql`
- `002_add_user_settings.sql`
- etc.

This allows for versioned, incremental database updates.
