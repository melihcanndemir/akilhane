-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;



-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text,
  updated_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT, -- Remove foreign key constraint
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text,
  updated_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  text TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  formula TEXT,
  created_by TEXT, -- Remove foreign key constraint
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text,
  updated_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER NOT NULL,
  weak_topics TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create performance_analytics table
CREATE TABLE IF NOT EXISTS performance_analytics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  average_score REAL NOT NULL,
  total_tests INTEGER NOT NULL,
  average_time_spent REAL NOT NULL,
  weak_topics TEXT NOT NULL,
  last_updated TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  recommended_difficulty TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create flashcard_progress table
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  card_id TEXT NOT NULL,
  is_known BOOLEAN NOT NULL DEFAULT false,
  review_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed TEXT,
  next_review TEXT,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text,
  updated_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::text
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject ON quiz_results(subject);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_user_id ON performance_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_subject ON flashcard_progress(subject);

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- RLS Policies for subjects
CREATE POLICY "Users can view own subjects" ON subjects
  FOR SELECT USING (auth.uid()::text = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update own subjects" ON subjects
  FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete own subjects" ON subjects
  FOR DELETE USING (auth.uid()::text = created_by);

-- RLS Policies for questions
CREATE POLICY "Users can view own questions" ON questions
  FOR SELECT USING (auth.uid()::text = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert own questions" ON questions
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update own questions" ON questions
  FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete own questions" ON questions
  FOR DELETE USING (auth.uid()::text = created_by);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own quiz results" ON quiz_results
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own quiz results" ON quiz_results
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for performance_analytics
CREATE POLICY "Users can view own performance analytics" ON performance_analytics
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own performance analytics" ON performance_analytics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own performance analytics" ON performance_analytics
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own performance analytics" ON performance_analytics
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view own AI recommendations" ON ai_recommendations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own AI recommendations" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own AI recommendations" ON ai_recommendations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own AI recommendations" ON ai_recommendations
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for flashcard_progress
CREATE POLICY "Users can view own flashcard progress" ON flashcard_progress
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own flashcard progress" ON flashcard_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own flashcard progress" ON flashcard_progress
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own flashcard progress" ON flashcard_progress
  FOR DELETE USING (auth.uid()::text = user_id);



-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (now() AT TIME ZONE 'UTC')::text;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_progress_updated_at BEFORE UPDATE ON flashcard_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 