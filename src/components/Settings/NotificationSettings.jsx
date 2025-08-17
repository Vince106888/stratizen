import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";

export default function NotificationSettings() {
  const auth = getAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    inApp: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user notification settings on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!auth.currentUser) return;
      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        setNotifications({
          email: profile?.settings?.notifications?.email ?? true,
          push: profile?.settings?.notifications?.push ?? true,
          inApp: profile?.settings?.notifications?.inApp ?? true,
        });
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [auth]);

  // Handle toggle
  const handleToggle = async (type) => {
    const updated = { ...notifications, [type]: !notifications[type] };
    setNotifications(updated);

    if (!auth.currentUser) return;
    try {
      await updateUserProfile(auth.currentUser.uid, {
        settings: { notifications: updated },
      });
    } catch (err) {
      console.error("Error updating notifications:", err);
    }
  };

  if (loading) return <p>Loading notification settings...</p>;

  return (
    <div className="notification-settings">
      <h2>Manage your notifications</h2>
      <div className="notification-toggle">
        <label>
          <input
            type="checkbox"
            checked={notifications.email}
            onChange={() => handleToggle("email")}
          />
          Email Notifications
        </label>
      </div>
      <div className="notification-toggle">
        <label>
          <input
            type="checkbox"
            checked={notifications.push}
            onChange={() => handleToggle("push")}
          />
          Push Notifications
        </label>
      </div>
      <div className="notification-toggle">
        <label>
          <input
            type="checkbox"
            checked={notifications.inApp}
            onChange={() => handleToggle("inApp")}
          />
          In-App Notifications
        </label>
      </div>
      <p className="settings-note">
        Changes are saved automatically.
      </p>
    </div>
  );
}
