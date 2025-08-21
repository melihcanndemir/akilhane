import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { errorLogger } from "@/lib/error-logger";

// Debug logger for development environment
const debugLog = (message: string, data?: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[QuestionManagerAuth] ${message}`, data);
  }
};

export const useQuestionManagerAuth = (
  isAuthenticated: boolean | null,
  setIsAuthenticated: (value: boolean) => void,
) => {
  useEffect(() => {
    const checkAuth = async () => {
      debugLog('🔐 Checking authentication status...');

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Check if there's a real session
        const hasSession = Boolean(session?.access_token);
        debugLog('🔐 Session exists:', hasSession);

        // If session exists, test if it's actually working
        if (hasSession) {
          try {
            debugLog('🔐 Testing Supabase connection...');
            // Test: Try to fetch simple data from Supabase
            const testResult = await supabase.from('subjects').select('count').limit(1);

            // If there's an error or data is null, there's no real authentication
            if (testResult.error || testResult.data === null) {
              debugLog('🔐 Supabase test failed, setting auth to false');
              errorLogger.logError('Supabase authentication test failed', testResult.error, {
                context: 'checkAuth',
                hasSession,
              });
              setIsAuthenticated(false);
              return;
            }

            debugLog('🔐 Authentication confirmed, setting auth to true');
            setIsAuthenticated(true);
          } catch (error) {
            debugLog('🔐 Supabase test error, setting auth to false:', error);
            errorLogger.logError('Supabase connection test error', error, {
              context: 'checkAuth',
              hasSession,
            });
            setIsAuthenticated(false);
          }
        } else {
          debugLog('🔐 No session found, setting auth to false');
          setIsAuthenticated(false);
        }
      } catch (error) {
        debugLog('🔐 Auth check error, setting auth to false:', error);
        errorLogger.logError('Authentication check error', error, {
          context: 'checkAuth',
        });
        setIsAuthenticated(false);
      }
    };

    // Only run auth check if authentication status is null (initial load)
    if (isAuthenticated === null) {
      checkAuth();
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog('🔐 Auth state changed:', { event, session: Boolean(session) });

      if (event === 'SIGNED_IN' && session) {
        // Test authentication when signed in
        try {
          debugLog('🔐 Testing auth after sign in...');
          const testResult = await supabase.from('subjects').select('count').limit(1);
          if (testResult.error || testResult.data === null) {
            debugLog('🔐 Auth test failed after sign in');
            errorLogger.logError('Authentication test failed after sign in', testResult.error, {
              context: 'authStateChange',
              event,
            });
            setIsAuthenticated(false);
          } else {
            debugLog('🔐 Auth confirmed after sign in');
            setIsAuthenticated(true);
          }
        } catch (error) {
          debugLog('🔐 Auth test error after sign in:', error);
          errorLogger.logError('Authentication test error after sign in', error, {
            context: 'authStateChange',
            event,
          });
          setIsAuthenticated(false);
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        debugLog('🔐 User signed out or no session');
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated, setIsAuthenticated]);

  return { isAuthenticated };
};
