-- AI Chat History Migration
-- Create AI Chat History table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create AI Chat Sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  title TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS for AI chat tables
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_chat_history
CREATE POLICY "Users can view own AI chat history" ON ai_chat_history
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own AI chat history" ON ai_chat_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own AI chat history" ON ai_chat_history
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own AI chat history" ON ai_chat_history
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for ai_chat_sessions
CREATE POLICY "Users can view own AI chat sessions" ON ai_chat_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own AI chat sessions" ON ai_chat_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own AI chat sessions" ON ai_chat_sessions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own AI chat sessions" ON ai_chat_sessions
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_session_id ON ai_chat_sessions(session_id); 