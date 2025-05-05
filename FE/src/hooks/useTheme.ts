// src/hooks/useTheme.ts (Example Hook)
import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("light"); // Default theme

  // Function to apply the theme class to the root element
  const applyTheme = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove(selectedTheme === "light" ? "dark" : "light");
    root.classList.add(selectedTheme);
    localStorage.setItem("theme", selectedTheme); // Save preference
    setTheme(selectedTheme);
  }, []);

  // Effect to load saved theme or detect system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      applyTheme(savedTheme);
    } else if (prefersDark) {
      applyTheme("dark");
    } else {
      applyTheme("light"); // Apply default if nothing else matches
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyTheme]); // Only run once on mount

  // Function to toggle the theme
  const toggleTheme = () => {
    applyTheme(theme === "light" ? "dark" : "light");
  };

  return [theme, toggleTheme];
}
