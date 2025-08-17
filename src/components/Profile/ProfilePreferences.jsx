import React from "react";
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

  return (
    <div className="profile-preferences-container">
      <h2>Preferences & Privacy</h2>

      {/* Notifications */}
      <section className="preference-section">
        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.notificationsEnabled}
            onChange={() => handleToggle("notificationsEnabled")}
            aria-label="Enable Notifications"
          />
          <span className="slider" />
          Enable Notifications
        </label>
      </section>

      {/* Theme */}
      <section className="preference-section">
        <h3>Theme Preference</h3>
        <div className="theme-options">
          {["auto", "light", "dark"].map((option) => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                name="themePreference"
                value={option}
                checked={form.themePreference === option}
                onChange={(e) => handleChange("themePreference", e.target.value)}
              />
              {option === "auto"
                ? "Auto (Follow system)"
                : option.charAt(0).toUpperCase() + option.slice(1)}
            </label>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="preference-section">
        <h3>Privacy Settings</h3>
        <p>
          Manage your visibility and data sharing preferences in{" "}
          <button
            className="link-button"
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
