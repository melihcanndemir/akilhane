// src/lib/supabase.ts - HARDCODE FIX FOR DEMO
import { createClient } from '@supabase/supabase-js';

// HARDCODED VALUES - Environment loading is broken
const HARDCODED_SUPABASE_URL = 'https://gjdjjwvhxlhlftjwykcj.supabase.co';
const HARDCODED_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGpqd3ZoeGxobGZ0and5a2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NDQ5MDUsImV4cCI6MjA1MDUyMDkwNX0.REPLACE_WITH_REAL_ANON_KEY';

// Use hardcoded values since env loading is broken
const supabaseUrl = HARDCODED_SUPABASE_URL;
const supabaseAnonKey = HARDCODED_SUPABASE_ANON_KEY;

console.log('🚀 Using hardcoded Supabase values (env loading broken)');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}; 