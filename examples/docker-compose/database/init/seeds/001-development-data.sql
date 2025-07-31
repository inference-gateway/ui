-- Seed data for development and testing
-- This file contains initial data for the Inference Gateway UI

-- Insert some sample user preferences for development
-- Note: In production, these would be created when users first visit the app

INSERT INTO user_preferences (user_id, selected_model, created_at, updated_at) 
VALUES 
  ('dev-user-1', 'gpt-4', NOW(), NOW()),
  ('dev-user-2', 'claude-3-sonnet', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert some sample chat sessions for development
INSERT INTO chat_sessions (id, title, user_id, messages, token_usage, created_at)
VALUES 
  (
    'sample-chat-1',
    'Welcome Chat',
    'dev-user-1',
    '[
      {
        "id": "msg-1",
        "role": "user",
        "content": "Hello, can you help me get started with the Inference Gateway?",
        "timestamp": "2025-07-31T10:00:00Z"
      },
      {
        "id": "msg-2", 
        "role": "assistant",
        "content": "Hello! I''d be happy to help you get started with the Inference Gateway. This is a platform that provides a unified interface for interacting with various AI models. What would you like to know?",
        "timestamp": "2025-07-31T10:00:05Z"
      }
    ]'::jsonb,
    '{"prompt_tokens": 25, "completion_tokens": 45, "total_tokens": 70}'::jsonb,
    NOW()
  ),
  (
    'sample-chat-2',
    'API Usage Example',
    'dev-user-2',
    '[
      {
        "id": "msg-1",
        "role": "user", 
        "content": "How do I use the TypeScript SDK?",
        "timestamp": "2025-07-31T11:00:00Z"
      },
      {
        "id": "msg-2",
        "role": "assistant",
        "content": "To use the Inference Gateway TypeScript SDK, you can install it via npm and then import it in your project. Here''s a quick example:\n\n```typescript\nimport { InferenceGateway } from ''@inference-gateway/typescript-sdk'';\n\nconst client = new InferenceGateway({\n  baseURL: ''http://localhost:8080'',\n  apiKey: ''your-api-key''\n});\n```",
        "timestamp": "2025-07-31T11:00:10Z"
      }
    ]'::jsonb,
    '{"prompt_tokens": 30, "completion_tokens": 85, "total_tokens": 115}'::jsonb,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Update user preferences to reference the sample chats
UPDATE user_preferences 
SET active_chat_id = 'sample-chat-1', updated_at = NOW()
WHERE user_id = 'dev-user-1';

UPDATE user_preferences 
SET active_chat_id = 'sample-chat-2', updated_at = NOW() 
WHERE user_id = 'dev-user-2';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully';
END $$;
