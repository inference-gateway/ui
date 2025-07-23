# Supabase Storage Provider

This document explains how to configure and use Supabase as a storage provider for conversation history in the Inference Gateway UI.

## Overview

The Supabase storage provider allows you to store chat sessions and user preferences in a Supabase PostgreSQL database, providing:

- **Persistent storage** across devices and sessions
- **User isolation** with Row Level Security (RLS)
- **Scalability** for multiple users
- **Backup and recovery** capabilities
- **Real-time synchronization** (future enhancement)

## Prerequisites

1. A Supabase account and project
2. Basic knowledge of Supabase dashboard and SQL editor

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note your project URL and anon key from the project settings

### 2. Set Up Database Schema

1. Open the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql` from the project root
3. Run the SQL script to create the necessary tables and policies

The schema creates two main tables:
- `chat_sessions`: Stores chat conversation data
- `user_preferences`: Stores user settings like active chat and selected model

### 3. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Storage Configuration
NEXT_PUBLIC_STORAGE_TYPE=supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace the values with your actual Supabase project URL and anonymous key.

### 4. Authentication (Optional)

If you're using authentication in your application, the storage provider will automatically use the user's ID or email for data isolation. Without authentication, you can still use Supabase storage, but all data will be associated with a single user.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_STORAGE_TYPE` | Storage provider type | No | `local` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes (if using Supabase) | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes (if using Supabase) | - |

## Fallback Behavior

If Supabase configuration is incomplete or invalid, the application will automatically fall back to local storage with a warning logged to the console.

## Database Schema

### chat_sessions
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Unique chat session identifier |
| `title` | TEXT | Chat session title |
| `messages` | JSONB | Array of chat messages |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `user_id` | TEXT | User identifier for isolation |
| `token_usage` | JSONB | Token usage statistics |

### user_preferences
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT | User identifier (primary key) |
| `active_chat_id` | TEXT | Currently active chat session ID |
| `selected_model` | TEXT | User's selected AI model |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Security

The storage implementation includes:

- **Row Level Security (RLS)** policies ensuring users can only access their own data
- **Input validation** and sanitization
- **Error handling** to prevent data exposure
- **Automatic user isolation** based on authentication

## Migration from Local Storage

To migrate existing chat data from local storage to Supabase:

1. Set up Supabase as described above
2. Export your existing chat data using browser developer tools
3. Manually import the data through the Supabase dashboard or create a migration script

Note: Automatic migration tools are not currently provided.

## Troubleshooting

### Common Issues

1. **Configuration Error**: Check that your environment variables are properly set and match your Supabase project
2. **Permission Errors**: Verify that RLS policies are correctly configured
3. **Connection Issues**: Ensure your Supabase project is active and the URL is correct

### Debug Mode

Enable debug logging by setting `NEXT_PUBLIC_LOG_LEVEL=debug` to see detailed storage operations in the browser console.

### Support

For Supabase-specific issues, consult the [Supabase Documentation](https://supabase.com/docs). For application-specific issues, check the application logs and ensure proper configuration.