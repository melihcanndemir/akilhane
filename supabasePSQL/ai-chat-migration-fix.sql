-- AI Chat Migration Fix - Disable RLS
-- Since we're using application-level security with userId filtering,
-- we don't need RLS policies that cause issues with server-side operations

-- Disable RLS for AI chat tables
ALTER TABLE ai_chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can insert own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can update own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can delete own AI chat history" ON ai_chat_history;

DROP POLICY IF EXISTS "Users can view own AI chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can insert own AI chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update own AI chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can delete own AI chat sessions" ON ai_chat_sessions; 