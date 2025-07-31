-- Migration 001: Create chat tables for PostgreSQL storage
-- This creates the necessary tables to store chat sessions, messages, and user preferences

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Token usage tracking
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    
    -- Index for faster queries
    INDEX idx_chat_sessions_user_id (user_id),
    INDEX idx_chat_sessions_created_at (created_at)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT,
    model VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional message fields from inference gateway SDK
    tool_calls JSONB,
    tool_call_id VARCHAR(255),
    name VARCHAR(255),
    
    -- Index for faster queries
    INDEX idx_messages_session_id (session_id),
    INDEX idx_messages_created_at (created_at)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    active_chat_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    selected_model VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Index for faster queries
    INDEX idx_user_preferences_active_chat_id (active_chat_id)
);

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE chat_sessions IS 'Stores chat sessions with metadata and token usage';
COMMENT ON TABLE messages IS 'Stores individual messages within chat sessions';
COMMENT ON TABLE user_preferences IS 'Stores user preferences including active chat and selected model';
COMMENT ON COLUMN messages.tool_calls IS 'JSON array of tool calls in the message';
COMMENT ON COLUMN messages.tool_call_id IS 'ID of the tool call this message responds to';