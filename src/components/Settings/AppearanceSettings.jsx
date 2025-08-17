import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";

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

  // Apply theme to document body
  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    <div>
      <h2>Appearance Settings</h2>
      <div style={{ marginTop: "1rem" }}>
        <label style={{ cursor: "pointer", fontSize: "14px" }}>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
            style={{ marginRight: "8px" }}
          />
          Enable Dark Mode
        </label>
      </div>
    </div>
  );
}
