import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";

export default function AccountSettings() {
  const auth = getAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user's account info from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile) {
          setForm({
            fullName: profile.fullName || "",
            username: profile.username || "",
            bio: profile.bio || "",
            profilePicture: profile.profilePicture || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture upload (simplified: URL input)
  const handlePictureChange = (e) => {
    setForm((prev) => ({ ...prev, profilePicture: e.target.value }));
  };

  // Save changes to Firestore
  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateUserProfile(auth.currentUser.uid, {
        fullName: form.fullName,
        username: form.username,
        bio: form.bio,
        profilePicture: form.profilePicture,
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading account info...</p>;

  return (
    <div className="account-settings">
      <h2>Account & Profile</h2>

      <div style={{ marginTop: "1rem" }}>
        <label>
          Full Name:
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </label>
      </div>

      <div>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter username"
          />
        </label>
      </div>

      <div>
        <label>
          Bio:
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Write a short bio"
            rows={3}
          />
        </label>
      </div>

      <div>
        <label>
          Profile Picture URL:
          <input
            type="text"
            name="profilePicture"
            value={form.profilePicture}
            onChange={handlePictureChange}
            placeholder="Enter image URL"
          />
        </label>
        {form.profilePicture && (
          <img
            src={form.profilePicture}
            alt="Profile Preview"
            style={{ width: "80px", height: "80px", borderRadius: "50%", marginTop: "8px" }}
          />
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: "1rem", padding: "8px 16px" }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
