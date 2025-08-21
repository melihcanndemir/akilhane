-- AI Chat Secure RLS Configuration
-- Re-enable RLS with proper policies

-- Enable RLS for AI chat tables
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Users can view own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can insert own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can update own AI chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can delete own AI chat history" ON ai_chat_history;

DROP POLICY IF EXISTS "Users can view own AI chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can insert own AI chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update own AI chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can delete own AI chat sessions" ON ai_chat_sessions;

-- RLS Policies for ai_chat_history
-- Users can only see their own chat history
CREATE POLICY "Users can view own AI chat history" ON ai_chat_history
  FOR SELECT USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only insert their own chat history
CREATE POLICY "Users can insert own AI chat history" ON ai_chat_history
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only update their own chat history
CREATE POLICY "Users can update own AI chat history" ON ai_chat_history
  FOR UPDATE USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only delete their own chat history
CREATE POLICY "Users can delete own AI chat history" ON ai_chat_history
  FOR DELETE USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- RLS Policies for ai_chat_sessions
-- Users can only see their own chat sessions
CREATE POLICY "Users can view own AI chat sessions" ON ai_chat_sessions
  FOR SELECT USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only insert their own chat sessions
CREATE POLICY "Users can insert own AI chat sessions" ON ai_chat_sessions
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only update their own chat sessions
CREATE POLICY "Users can update own AI chat sessions" ON ai_chat_sessions
  FOR UPDATE USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only delete their own chat sessions
CREATE POLICY "Users can delete own AI chat sessions" ON ai_chat_sessions
  FOR DELETE USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );