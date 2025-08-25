import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function AppearanceSettings() {
  const auth = getAuth();
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  // Load user's saved theme from Firestore
  useEffect(() => {
    const fetchTheme = async () => {
      if (!auth.currentUser) return;
      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile?.settings?.themePreference) {
          setTheme(profile.settings.themePreference);
          applyTheme(profile.settings.themePreference);
        }
      } catch (err) {
        console.error("Error fetching user theme:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [auth]);

  // Apply theme to <html> element
  const applyTheme = (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  // Toggle theme and save to Firestore
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);

    if (!auth.currentUser) return;
    try {
      await updateUserProfile(auth.currentUser.uid, {
        settings: { themePreference: newTheme },
      });
    } catch (err) {
      console.error("Error saving theme:", err);
    }
  };

  if (loading) return <p>Loading theme...</p>;

  return (
    <div className="appearance-settings">
      <h2 className="text-lg font-semibold mb-3">Appearance Settings</h2>
      <p className="text-sm text-gray-500 mb-4">
        Switch between light and dark mode. Your preference is saved to your account.
      </p>

      <motion.button
        whileTap={{ scale: 0.9, rotate: 10 }}
        className="flex items-center px-4 py-2 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 transition"
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun size={18} className="mr-2" />
        ) : (
          <Moon size={18} className="mr-2" />
        )}
        <span>Enable {theme === "dark" ? "Light" : "Dark"} Mode</span>
      </motion.button>
    </div>
  );
}
