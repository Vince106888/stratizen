import React, { createContext, useContext, useState, useEffect } from 'react'; // ✅ Single import

// 1. Create context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 2. State for theme
  const [theme, setTheme] = useState('light');

  // 3. On mount, read saved preference or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Optional: use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // 4. Toggle function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    // TODO: Optionally sync with Firebase user settings
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. Hook for easy access
export const useTheme = () => useContext(ThemeContext);
