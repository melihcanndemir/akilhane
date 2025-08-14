"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle auth state change and URL hash
    const handleAuthState = async () => {
      try {
        // Check if there's a hash in the URL (from OAuth callback)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1),
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

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
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
              );
            }
            setLoading(false);
            return;
          }
        }

        // Get initial session if no hash params
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle sign out
      if (event === "SIGNED_OUT") {
        setUser(null);
      }

      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        return;
      }

      // Check if supabase is available
      if (!supabase) {
        //console.error("Supabase client not available");
        return;
      }

      // Try to get current session first
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No active session, just clear local state
        setUser(null);
        window.location.href = "/landing";
        return;
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        //console.error("Logout error:", error);
        // Even if there's an error, clear local state
        setUser(null);
        window.location.href = "/landing";
        return;
      }

      // Logout successful
      setUser(null);
      window.location.href = "/landing";

    } catch /* (error) */ {
      //console.error("Logout exception:", error);
      // Even if there's an exception, try to clear state and redirect
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/landing";
      }
    }
  };
  return {
    user,
    loading,
    logout,
    isAuthenticated: Boolean(user),
  };
}
