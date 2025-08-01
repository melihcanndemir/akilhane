'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, signOut } from '@/lib/supabase';
import { dataMigrationService } from '@/services/data-migration-service';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // Handle auth state change and URL hash
    const handleAuthState = async () => {
      try {

        // Check if there's a hash in the URL (from OAuth callback)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
            } else {
              setUser(data.user);
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            setLoading(false);
            return;
          }
        }

        // Get initial session if no hash params
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
        } else if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    handleAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }

        // Handle sign in - trigger data migration
        if (event === 'SIGNED_IN' && newUser) {
          console.log('🔐 User signed in, checking for data migration');
          
          try {
            setIsMigrating(true);
            
            // Check if user has existing cloud data
            const hasCloudData = await dataMigrationService.hasExistingCloudData(newUser.id);
            
            if (!hasCloudData) {
              // No existing cloud data, migrate guest data
              console.log('📦 Migrating guest data to user account');
              const migrationResult = await dataMigrationService.migrateGuestDataToUser(newUser.id);
              
              if (migrationResult.success) {
                console.log('✅ Data migration successful:', migrationResult);
                
                // Clear guest data only after successful migration
                dataMigrationService.clearGuestData();
                
                // Trigger UI refresh
                await dataMigrationService.refreshDataState();
              } else {
                console.error('❌ Data migration failed:', migrationResult.errors);
              }
            } else {
              // User has existing cloud data, sync it to localStorage
              console.log('☁️ Syncing existing cloud data to localStorage');
              await dataMigrationService.syncCloudDataToLocalStorage(newUser.id);
              
              // Trigger UI refresh
              await dataMigrationService.refreshDataState();
            }
          } catch (error) {
            console.error('❌ Error during post-login processing:', error);
          } finally {
            setIsMigrating(false);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
  };
  return {
    user,
    loading: loading || isMigrating,
    isMigrating,
    logout,
    isAuthenticated: Boolean(user),
  };
}
