'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signOut } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle auth state change and URL hash
    const handleAuthState = async () => {
      try {
        console.log('🔍 useAuth: Starting authentication check...');
        
        // Check if there's a hash in the URL (from OAuth callback)
        if (typeof window !== 'undefined' && window.location.hash) {
          console.log('🔗 useAuth: Found URL hash:', window.location.hash);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('✅ useAuth: Found tokens in URL, setting session...');
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('❌ useAuth: Error setting session from URL:', error);
            } else {
              console.log('✅ useAuth: Session set successfully:', data.user?.email);
              setUser(data.user);
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            setLoading(false);
            return;
          }
        }

        // Get initial session if no hash params
        console.log('🔍 useAuth: Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ useAuth: Error getting session:', error);
        } else if (session) {
          console.log('✅ useAuth: Found existing session:', session.user.email);
          setUser(session.user);
        } else {
          console.log('ℹ️ useAuth: No existing session found');
          setUser(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ useAuth: Auth state error:', error);
        setLoading(false);
      }
    };

    handleAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Auth state changed:', event, session?.user?.email || 'no user');
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('👋 useAuth: User signed out');
          setUser(null);
        }
        
        if (event === 'SIGNED_IN') {
          console.log('👋 useAuth: User signed in:', session?.user?.email);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    console.log('🚪 useAuth: Logging out...');
    await signOut();
    setUser(null);
  };

  // Debug logging for current state
  console.log('🎯 useAuth current state:', { 
    user: user?.email || 'none', 
    loading, 
    isAuthenticated: !!user 
  });

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };
} 