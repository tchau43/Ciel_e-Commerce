import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("light");

  const applyTheme = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove(selectedTheme === "light" ? "dark" : "light");
    root.classList.add(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    setTheme(selectedTheme);
  }, []);

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
      applyTheme("light");
    }
  }, [applyTheme]);

  const toggleTheme = () => {
    applyTheme(theme === "light" ? "dark" : "light");
  };

  return [theme, toggleTheme];
}
