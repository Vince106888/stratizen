// src/components/Profile/ProfilePreferences.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Profile/ProfilePreferences.css";

const ProfilePreferences = ({ form, onChange }) => {
  const navigate = useNavigate();

  const handleToggle = (field) => {
    onChange(field, !form[field]);
  };

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  // 🔥 Apply theme changes dynamically
  useEffect(() => {
    const root = document.documentElement;
    if (form.themePreference === "dark") {
      root.classList.add("dark");
    } else if (form.themePreference === "light") {
      root.classList.remove("dark");
    } else {
      // Auto: follow system
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [form.themePreference]);

  return (
    <div className="profile-preferences-container bg-white dark:bg-strathmore-dark shadow-lg rounded-2xl p-6 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 text-strathmore-blue dark:text-strathmore-light">
        Preferences & Privacy
      </h2>

      {/* Notifications */}
      <section className="preference-section mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.notificationsEnabled}
            onChange={() => handleToggle("notificationsEnabled")}
            aria-label="Enable Notifications"
            className="peer hidden"
          />
          <span className="w-11 h-6 flex items-center bg-gray-300 rounded-full peer-checked:bg-strathmore-blue transition-colors">
            <span className="w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-5 transition-transform" />
          </span>
          <span className="text-gray-700 dark:text-gray-200">
            Enable Notifications
          </span>
        </label>
      </section>

      {/* Theme */}
      <section className="preference-section mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
          Theme Preference
        </h3>
        <div className="flex flex-col gap-2">
          {["auto", "light", "dark"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <input
                type="radio"
                name="themePreference"
                value={option}
                checked={form.themePreference === option}
                onChange={(e) =>
                  handleChange("themePreference", e.target.value)
                }
                className="text-strathmore-blue focus:ring-strathmore-blue"
              />
              <span className="capitalize text-gray-800 dark:text-gray-200">
                {option === "auto"
                  ? "Auto (Follow system)"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="preference-section">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
          Privacy Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your visibility and data sharing preferences in{" "}
          <button
            className="text-strathmore-blue dark:text-strathmore-light hover:underline font-medium"
            onClick={() => navigate("/settings")}
          >
            Settings
          </button>
          .
        </p>
      </section>
    </div>
  );
};

export default ProfilePreferences;
