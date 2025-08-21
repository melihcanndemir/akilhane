import { useState, useEffect, useCallback } from 'react';
import { CloudSyncService } from '@/services/cloud-sync-service';
import { useAuth } from './useAuth';

interface CloudSyncState {
  isLoading: boolean;
  error: string | null;
  syncStatus: {
    isLoggedIn: boolean;
    hasLocalData: boolean;
    hasCloudData: boolean;
    needsSync: boolean;
    localCounts: { subjects: number; questions: number };
    cloudCounts: { subjects: number; questions: number };
  } | null;
  lastSyncTime: Date | null;
}

export function useCloudSync() {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<CloudSyncState>({
    isLoading: false,
    error: null,
    syncStatus: null,
    lastSyncTime: null,
  });

  // Check sync status when user authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      checkSyncStatus();
    } else {
      setState(prev => ({
        ...prev,
        syncStatus: null,
        error: null,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]); // Only depend on user.id to avoid object reference changes

  const checkSyncStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const status = await CloudSyncService.getSyncStatus();

      setState(prev => ({
        ...prev,
        isLoading: false,
        syncStatus: status,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Sync status kontrolü başarısız: ${error}`,
      }));
    }
  }, []); // No dependencies needed as it doesn't use external state

  // Silent version for refresh after sync operations
  const checkSyncStatusSilently = useCallback(async () => {
    try {
      const status = await CloudSyncService.getSyncStatus();
      setState(prev => ({
        ...prev,
        syncStatus: status,
        error: null,
      }));
    } catch {
      // Silent error handling - don't update loading state or show error
    }
  }, []);

  const syncLocalToCloud = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await CloudSyncService.syncLocalToCloud();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          lastSyncTime: new Date(),
        }));

        // Refresh sync status silently without showing success message
        setTimeout(() => {
          checkSyncStatusSilently();
        }, 1000);

        return result;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message,
        }));

        return result;
      }
    } catch (error) {
      const errorMessage = `Local to cloud sync hatası: ${error}`;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const syncCloudToLocal = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await CloudSyncService.syncCloudToLocal();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          lastSyncTime: new Date(),
        }));

        // Refresh sync status silently without showing success message
        setTimeout(() => {
          checkSyncStatusSilently();
        }, 1000);

        return result;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message,
        }));

        return result;
      }
    } catch (error) {
      const errorMessage = `Cloud to local sync hatası: ${error}`;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const fullSync = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await CloudSyncService.fullSync();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          lastSyncTime: new Date(),
        }));

        // Refresh sync status silently without showing success message
        setTimeout(() => {
          checkSyncStatusSilently();
        }, 1000);

        return result;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message,
        }));

        return result;
      }
    } catch (error) {
      const errorMessage = `Full sync hatası: ${error}`;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const testConnection = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await CloudSyncService.testCloudConnection();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: result.success ? null : result.message,
      }));

      return result;
    } catch (error) {
      const errorMessage = `Bağlantı testi hatası: ${error}`;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    syncStatus: state.syncStatus,
    lastSyncTime: state.lastSyncTime,

    // Helper computed values
    isLoggedIn: isAuthenticated,
    needsSync: state.syncStatus?.needsSync || false,
    hasLocalData: state.syncStatus?.hasLocalData || false,
    hasCloudData: state.syncStatus?.hasCloudData || false,

    // Actions
    checkSyncStatus,
    syncLocalToCloud,
    syncCloudToLocal,
    fullSync,
    testConnection,
    clearError,
  };
}
