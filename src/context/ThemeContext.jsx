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
    if (themeValue === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
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

  // 5. Listen for system preference changes (if user hasn’t overridden)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const systemThemeListener = (e) => {
      if (!localStorage.getItem("theme")) {
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
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {isReady ? children : <div className="w-full h-screen bg-white dark:bg-black" />} 
    </ThemeContext.Provider>
  );
};

// 7. Hook for easy access
export const useTheme = () => useContext(ThemeContext);
