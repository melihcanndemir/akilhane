-- Flashcards RLS Configuration
-- Enable RLS and create proper policies

-- Enable RLS for flashcards table
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can insert own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete own flashcards" ON flashcards;

-- RLS Policies for flashcards
-- Users can only see their own flashcards
CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR SELECT USING (
    auth.uid() = user_id::uuid OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only insert their own flashcards
CREATE POLICY "Users can insert own flashcards" ON flashcards
  FOR INSERT WITH CHECK (
    auth.uid() = user_id::uuid OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only update their own flashcards
CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (
    auth.uid() = user_id::uuid OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );

-- Users can only delete their own flashcards
CREATE POLICY "Users can delete own flashcards" ON flashcards
  FOR DELETE USING (
    auth.uid() = user_id::uuid OR 
    auth.role() = 'service_role'  -- Allow service role to bypass
  );