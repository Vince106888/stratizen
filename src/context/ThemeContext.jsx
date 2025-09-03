// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Create context
const ThemeContext = createContext();

// 2. Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isReady, setIsReady] = useState(false); // prevent flicker before hydration

  // Helper: apply theme to <html>
  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(themeValue);
  };

  // 3. On mount → read saved preference or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }

    setIsReady(true);
  }, []);

  // 4. Sync theme whenever it changes
  useEffect(() => {
    if (!isReady) return;
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme, isReady]);

  // 5. Listen for system preference changes (only if no manual override)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const systemThemeListener = (e) => {
      const userSet = localStorage.getItem("theme");
      if (!userSet) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mq.addEventListener("change", systemThemeListener);
    return () => mq.removeEventListener("change", systemThemeListener);
  }, []);

  // 6. Toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // 7. Provide context
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {isReady ? (
        children
      ) : (
        // Placeholder prevents flash while loading
        <div className="w-full h-screen bg-bg text-text transition-colors"></div>
      )}
    </ThemeContext.Provider>
  );
};

// 8. Hook for easy access
export const useTheme = () => useContext(ThemeContext);
