"use client";

import { useState, useEffect, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "./useAuth";

interface GuestUser {
  id: string;
  name: string;
  email?: string;
  isGuest: true;
  createdAt: string;
  preferences: {
    defaultSubject?: string;
    questionsPerQuiz?: number;
    difficulty?: "Easy" | "Medium" | "Hard";
    theme?: "light" | "dark" | "system";
  };
}

interface LocalAuthUser extends GuestUser {
  isGuest: true;
}

interface SupabaseAuthUser extends User {
  isGuest: false;
}

type AuthUser = LocalAuthUser | SupabaseAuthUser | null;

export function useLocalAuth() {
  const { user: supabaseUser, loading: supabaseLoading } = useAuth();
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize guest user if no Supabase user
  useEffect(() => {
    if (!supabaseLoading) {
      if (supabaseUser) {
        // User is logged in with Supabase
        setGuestUser(null);
        setLoading(false);
      } else {
        // No Supabase user, check for guest user
        initializeGuestUser();
      }
    }
  }, [supabaseUser, supabaseLoading]);

  const initializeGuestUser = () => {
    try {
      const storedGuestUser = localStorage.getItem("guestUser");

      if (storedGuestUser) {
        const parsed = JSON.parse(storedGuestUser);
        setGuestUser(parsed);
      } else {
        // Create new guest user
        const newGuestUser: GuestUser = {
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: "Misafir Kullanıcı",
          isGuest: true,
          createdAt: new Date().toISOString(),
          preferences: {
            defaultSubject: "Matematik",
            questionsPerQuiz: 10,
            difficulty: "Medium",
            theme: "system",
          },
        };

        localStorage.setItem("guestUser", JSON.stringify(newGuestUser));
        setGuestUser(newGuestUser);
      }
    } catch {
      // Create fallback guest user
      const fallbackGuestUser: GuestUser = {
        id: `guest_fallback_${Date.now()}`,
        name: "Misafir Kullanıcı",
        isGuest: true,
        createdAt: new Date().toISOString(),
        preferences: {},
      };
      setGuestUser(fallbackGuestUser);
    } finally {
      setLoading(false);
    }
  };

  const updateGuestUser = (updates: Partial<GuestUser>) => {
    if (guestUser) {
      const updatedUser = { ...guestUser, ...updates };
      setGuestUser(updatedUser);
      localStorage.setItem("guestUser", JSON.stringify(updatedUser));
    }
  };

  const updateGuestPreferences = (
    preferences: Partial<GuestUser["preferences"]>,
  ) => {
    if (guestUser) {
      const updatedUser = {
        ...guestUser,
        preferences: { ...guestUser.preferences, ...preferences },
      };
      setGuestUser(updatedUser);
      localStorage.setItem("guestUser", JSON.stringify(updatedUser));
    }
  };

  const clearGuestData = () => {
    localStorage.removeItem("guestUser");
    localStorage.removeItem("guestQuizResults");
    localStorage.removeItem("guestFlashcardProgress");
    localStorage.removeItem("guestPerformanceData");
    localStorage.removeItem("userSettings");
    setGuestUser(null);
  };

  // Export guest data for backup
  const exportGuestData = () => {
    if (!guestUser) {
      return null;
    }

    const data = {
      user: guestUser,
      quizResults: JSON.parse(localStorage.getItem("guestQuizResults") || "[]"),
      flashcardProgress: JSON.parse(
        localStorage.getItem("guestFlashcardProgress") || "{}",
      ),
      performanceData: JSON.parse(
        localStorage.getItem("guestPerformanceData") || "[]",
      ),
      settings: JSON.parse(localStorage.getItem("userSettings") || "{}"),
      exportDate: new Date().toISOString(),
    };

    return data;
  };

  // Import guest data from backup
  const importGuestData = (data: {
    user?: GuestUser;
    quizResults?: unknown[];
    flashcardProgress?: Record<string, unknown>;
    performanceData?: unknown[];
    settings?: Record<string, unknown>;
  }) => {
    try {
      if (data.user) {
        localStorage.setItem("guestUser", JSON.stringify(data.user));
        setGuestUser(data.user);
      }
      if (data.quizResults) {
        localStorage.setItem(
          "guestQuizResults",
          JSON.stringify(data.quizResults),
        );
      }
      if (data.flashcardProgress) {
        localStorage.setItem(
          "guestFlashcardProgress",
          JSON.stringify(data.flashcardProgress),
        );
      }
      if (data.performanceData) {
        localStorage.setItem(
          "guestPerformanceData",
          JSON.stringify(data.performanceData),
        );
      }
      if (data.settings) {
        localStorage.setItem("userSettings", JSON.stringify(data.settings));
      }
      return true;
    } catch {
      return false;
    }
  };

  // Migrate guest data to Supabase when user registers
  const migrateToSupabase = async () => {
    if (!guestUser || supabaseUser) {
      return false;
    }

    try {
      const guestData = exportGuestData();

      // Store guest data in Supabase user metadata or separate migration endpoint
      // This would need to be implemented in your API
      const response = await fetch("/api/migrate-guest-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestData),
      });

      if (response.ok) {
        clearGuestData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Determine current user (Supabase user takes precedence) - Memoized to prevent infinite re-renders
  const currentUser: AuthUser = useMemo(
    () =>
      supabaseUser
        ? ({ ...supabaseUser, isGuest: false } as SupabaseAuthUser)
        : guestUser,
    [supabaseUser, guestUser],
  );

  const isAuthenticated = Boolean(supabaseUser || guestUser);
  const isGuest = !supabaseUser && Boolean(guestUser);

  return {
    user: currentUser,
    loading: loading || supabaseLoading,
    isAuthenticated,
    isGuest,
    guestUser,
    supabaseUser,
    updateGuestUser,
    updateGuestPreferences,
    clearGuestData,
    exportGuestData,
    importGuestData,
    migrateToSupabase,
    initializeGuestUser,
  };
}
