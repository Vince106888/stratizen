// src/components/Profile/ProfileOverview.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";
import { useNavigate } from "react-router-dom";
import ProfileImage from "./ProfileImage";
import "../../styles/Profile/ProfileOverview.css";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const auth = getAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    year: "",
    school: "",
    group: "",
    bio: "",
    interests: "",
    residence: "",
    profileImageUrl: "",
  });
  const [initialData, setInitialData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch profile from Firestore
  const fetchProfile = useCallback(async (uid) => {
    try {
      const data = await getUserProfile(uid);
      if (data) {
        const filledData = {
          username: data.username || "",
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          year: data.year || "",
          school: data.school || "",
          group: data.group || "",
          bio: data.bio || "",
          interests: data.interests || "",
          residence: data.residence || "",
          profileImageUrl: data.profileImageUrl || "",
        };
        setProfileData(filledData);
        setInitialData(filledData);
      }
    } catch (error) {
      console.error("[fetchProfile] Error:", error);
      setErrorMessage("Failed to load profile data.");
    }
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchProfile(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [auth, fetchProfile, navigate]);

  // Track unsaved changes
  useEffect(() => {
    if (!initialData) return;
    const changed = Object.keys(profileData).some(
      (key) => profileData[key] !== initialData[key]
    );
    setHasChanges(changed);
  }, [profileData, initialData]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Validation
  const validateProfile = () => {
    const requiredFields = ["fullName", "email", "phone", "year", "school", "group"];
    for (const field of requiredFields) {
      if (!profileData[field]?.trim()) {
        setErrorMessage(`Please fill in the required field: ${field}`);
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  // Save profile
  const handleSave = async () => {
    if (!validateProfile()) return;
    if (!user) {
      setErrorMessage("No authenticated user.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateUserProfile(user.uid, { ...profileData });
      setSuccessMessage("✔️ Profile saved successfully!");
      setInitialData(profileData);
      setHasChanges(false);
    } catch (error) {
      console.error("[handleSave] Save error:", error);
      setErrorMessage("❌ Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Form fields config
  const fields = [
    { label: "Preferred Name", name: "username", type: "text" },
    { label: "Full Name*", name: "fullName", type: "text" },
    { label: "Email*", name: "email", type: "email" },
    { label: "Phone*", name: "phone", type: "tel" },
    { label: "Year*", name: "year", type: "text" },
    { label: "School*", name: "school", type: "text" },
    { label: "Group*", name: "group", type: "text" },
    { label: "Residence", name: "residence", type: "text" },
    { label: "Bio", name: "bio", type: "textarea" },
    { label: "Interests", name: "interests", type: "textarea" },
  ];

  return (
    <div className={`profile-overview-container-wrapper ${isDark ? "dark-mode" : ""}`}>
      <div
        className={`profile-overview-container ${isDark ? "dark-mode" : ""}`}
        role="main"
        aria-label="User Profile Overview"
      >
        <h2 className="profile-title">Profile Overview</h2>

        <ProfileImage
          uid={user?.uid}
          initialImageUrl={profileData.profileImageUrl}
          onChange={(url) =>
            setProfileData((prev) => ({ ...prev, profileImageUrl: url }))
          }
        />

        <div className="form-fields-container">
          {fields.map(({ label, name, type }) => (
            <div className="form-group" key={name}>
              <label className="form-label" htmlFor={name}>
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  id={name}
                  name={name}
                  className={`textarea-field ${isDark ? "dark-mode" : ""}`}
                  value={profileData[name]}
                  onChange={handleChange}
                  rows={name === "bio" ? 4 : 3}
                />
              ) : (
                <input
                  id={name}
                  type={type}
                  name={name}
                  className={`input-text ${isDark ? "dark-mode" : ""}`}
                  value={profileData[name]}
                  onChange={handleChange}
                  aria-required={label.includes("*")}
                  aria-invalid={errorMessage.includes(name)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="profile-save-section">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`btn-save ${isDark ? "dark-mode" : ""}`}
          >
            {isSaving ? "💾 Saving..." : "✅ Save Changes"}
          </button>

          {errorMessage && (
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="success-message" role="status">
              {successMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
