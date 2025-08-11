import React from "react";
import "../../styles/Profile/ProfilePreferences.css";

const ProfilePreferences = ({ form, onChange }) => {
  const handleToggleNotifications = () => {
    onChange("notificationsEnabled", !form.notificationsEnabled);
  };

  const handleThemeChange = (e) => {
    onChange("themePreference", e.target.value);
  };

  return (
    <div className="profile-preferences-container">
      <h2>Preferences & Privacy</h2>

      <section className="preference-section">
        <label className="switch-label">
          <input
            type="checkbox"
            checked={form.notificationsEnabled}
            onChange={handleToggleNotifications}
          />
          <span className="slider" />
          Enable Notifications
        </label>
        <p className="helper-text">
          Turn notifications on or off to control if you want to receive updates.
        </p>
      </section>

      <section className="preference-section">
        <label htmlFor="themePreference" className="select-label">
          Theme Preference
        </label>
        <select
          id="themePreference"
          value={form.themePreference}
          onChange={handleThemeChange}
          className="select-field"
        >
          <option value="auto">Auto (Follow system)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>

      <section className="preference-section">
        <h3>Privacy Settings</h3>
        <p>Coming soon: Control your visibility, data sharing, and privacy preferences.</p>
      </section>

      <section className="disclaimer-section">
        <h4>Disclaimer</h4>
        <p>
          All information collected in this profile is used solely to personalize your experience within Stratizen,
          including messaging, notifications, and content delivery. We respect your privacy and
          will not share your data with third parties without your consent.
        </p>
      </section>
    </div>
  );
};

export default ProfilePreferences;
