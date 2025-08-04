"use client";

import { useEffect, useState } from "react";

interface AppearanceSettings {
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    fontSize: "medium",
    compactMode: false,
  });

  // Load appearance settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appearance) {
          setAppearance(parsed.appearance);
        }
      }
    } catch {
      // Error loading appearance settings
    }
  }, []);

  // Apply appearance settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Apply font size
    switch (appearance.fontSize) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "medium":
        root.style.fontSize = "16px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
      default:
        root.style.fontSize = "16px";
        break;
    }

    // Apply compact mode
    if (appearance.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [appearance]);

  return { appearance, setAppearance };
}
