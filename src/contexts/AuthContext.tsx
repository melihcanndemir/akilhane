'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { localStorageService } from '@/services/localStorage-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMigrating: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  migrateGuestDataToUser: (userId: string) => Promise<any>;
  syncCloudDataToLocal: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authHook = useAuth();
  const [lastUser, setLastUser] = useState<User | null>(null);

  // Enhanced refresh data function that ensures UI updates
  const refreshData = async () => {
    console.log('🔄 AuthContext: Refreshing application data...');
    
    try {
      // Trigger a custom event that components can listen to for data refresh
      const refreshEvent = new CustomEvent('auth-data-refresh', {
        detail: { 
          user: authHook.user,
          isAuthenticated: authHook.isAuthenticated,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(refreshEvent);
      
      // Force re-render of localStorage-dependent components
      const storageEvent = new CustomEvent('localStorage-update', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(storageEvent);
      
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  // Monitor auth changes and trigger data refresh
  useEffect(() => {
    const currentUser = authHook.user;
    const wasAuthenticated = !!lastUser;
    const nowAuthenticated = !!currentUser;

    // Handle login transition
    if (!wasAuthenticated && nowAuthenticated) {
      console.log('🎉 User logged in - triggering data refresh');
      setTimeout(refreshData, 1000); // Small delay to ensure migration completes
    }

    // Handle logout transition
    if (wasAuthenticated && !nowAuthenticated) {
      console.log('👋 User logged out - triggering data refresh');
      setTimeout(refreshData, 500);
    }

    setLastUser(currentUser);
  }, [authHook.user, authHook.isAuthenticated]);

  const contextValue: AuthContextType = {
    ...authHook,
    refreshData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Hook for components that need to respond to auth state changes
export function useAuthStateListener() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleAuthRefresh = () => {
      console.log('📡 Component received auth data refresh signal');
      setRefreshTrigger(prev => prev + 1);
    };

    const handleStorageUpdate = () => {
      console.log('📡 Component received localStorage update signal');
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('auth-data-refresh', handleAuthRefresh);
    window.addEventListener('localStorage-update', handleStorageUpdate);

    return () => {
      window.removeEventListener('auth-data-refresh', handleAuthRefresh);
      window.removeEventListener('localStorage-update', handleStorageUpdate);
    };
  }, []);

  return { refreshTrigger };
}