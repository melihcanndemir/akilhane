-- Create AI generation logs table for tracking AI-generated content
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('question', 'flashcard', 'explanation')),
  subject TEXT NOT NULL,
  topic TEXT,
  count INTEGER NOT NULL DEFAULT 0,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  metadata JSONB,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_generation_logs_generation_type ON ai_generation_logs(generation_type);
CREATE INDEX idx_ai_generation_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX idx_ai_generation_logs_subject ON ai_generation_logs(subject);

-- Add comment to table
COMMENT ON TABLE ai_generation_logs IS 'Logs for AI-generated content to monitor quality and usage';
COMMENT ON COLUMN ai_generation_logs.generation_type IS 'Type of content generated: question, flashcard, or explanation';
COMMENT ON COLUMN ai_generation_logs.quality_score IS 'Quality score between 0 and 1 assigned by the AI validation';
COMMENT ON COLUMN ai_generation_logs.metadata IS 'Additional metadata like difficulty, type, language, etc.';