import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useQuestionManagerAuth = (
  isAuthenticated: boolean | null,
  setIsAuthenticated: (value: boolean) => void,
) => {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Check if there's a real session
        const hasSession = Boolean(session?.access_token);

        // If session exists, test if it's actually working
        if (hasSession) {
          try {
            // Test: Try to fetch simple data from Supabase
            const testResult = await supabase.from('subjects').select('count').limit(1);

            // If there's an error or data is null, there's no real authentication
            if (testResult.error || testResult.data === null) {
              setIsAuthenticated(false);
              return;
            }

            setIsAuthenticated(true);
          } catch {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Test authentication when signed in
        try {
          const testResult = await supabase.from('subjects').select('count').limit(1);
          if (testResult.error || testResult.data === null) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } catch {
          setIsAuthenticated(false);
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setIsAuthenticated]);

  return { isAuthenticated };
};
