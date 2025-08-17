import React, { useState, useEffect } from "react";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";

export default function PrivacySettings() {
  const auth = getAuth();
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [twoFA, setTwoFA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;
      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        setProfileVisibility(profile?.settings?.privacy?.profileVisibility || "public");
        setTwoFA(profile?.settings?.privacy?.twoFA || false);
      } catch (err) {
        console.error("Error fetching privacy settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [auth]);

  // Handle visibility change
  const handleVisibilityChange = async (value) => {
    setProfileVisibility(value);
    if (!auth.currentUser) return;
    try {
      await updateUserProfile(auth.currentUser.uid, {
        settings: { privacy: { ...{ profileVisibility: value, twoFA }, twoFA } },
      });
    } catch (err) {
      console.error("Error updating visibility:", err);
    }
  };

  // Handle 2FA toggle
  const handleTwoFAToggle = async () => {
    const newValue = !twoFA;
    setTwoFA(newValue);
    if (!auth.currentUser) return;
    try {
      await updateUserProfile(auth.currentUser.uid, {
        settings: { privacy: { profileVisibility, twoFA: newValue } },
      });
    } catch (err) {
      console.error("Error updating 2FA:", err);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwords.oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwords.newPassword);
      setMessage("Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setMessage("Failed to update password: " + err.message);
    }
  };

  if (loading) return <p>Loading privacy & security settings...</p>;

  return (
    <div className="privacy-settings">
      <h2>Privacy & Security</h2>

      {/* Profile Visibility */}
      <section className="privacy-section">
        <h3>Profile Visibility</h3>
        <select
          value={profileVisibility}
          onChange={(e) => handleVisibilityChange(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="friends">Friends Only</option>
          <option value="private">Private</option>
        </select>
      </section>

      {/* 2FA Toggle */}
      <section className="privacy-section">
        <h3>Two-Factor Authentication (2FA)</h3>
        <label>
          <input
            type="checkbox"
            checked={twoFA}
            onChange={handleTwoFAToggle}
          />
          Enable 2FA
        </label>
      </section>

      {/* Password Change */}
      <section className="privacy-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="Old Password"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            required
          />
          <button type="submit">Update Password</button>
        </form>
        {message && <p className="privacy-message">{message}</p>}
      </section>
    </div>
  );
}
