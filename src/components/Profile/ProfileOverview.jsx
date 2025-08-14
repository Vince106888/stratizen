// src/components/Profile/ProfileOverview.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../../services/db";
import { useNavigate } from "react-router-dom";
import ProfileImage from "./ProfileImage";
import "../../styles/Profile/ProfileOverview.css";

export default function ProfileOverview() {
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

  const fetchProfile = useCallback(async (uid) => {
    console.log("[fetchProfile] Fetching profile for UID:", uid);
    try {
      const data = await getUserProfile(uid);
      console.log("[fetchProfile] Received data:", data);

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
        console.log("[fetchProfile] Profile state updated.");
      } else {
        console.warn("[fetchProfile] No profile data found for user.");
      }
    } catch (error) {
      console.error("[fetchProfile] Error:", error);
      setErrorMessage("Failed to load profile data.");
    }
  }, []);

  useEffect(() => {
    console.log("[useEffect:auth] Setting up auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("[auth listener] Current user:", currentUser);
      if (!currentUser) {
        console.warn("[auth listener] No user, redirecting to /login");
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchProfile(currentUser.uid);
      }
    });
    return () => {
      console.log("[useEffect:auth] Cleaning up auth listener...");
      unsubscribe();
    };
  }, [auth, fetchProfile, navigate]);

  useEffect(() => {
    if (!initialData) return;
    const changed = Object.keys(profileData).some(
      (key) => profileData[key] !== initialData[key]
    );
    setHasChanges(changed);
    console.log("[change tracker] hasChanges:", changed);
  }, [profileData, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[handleChange] Field changed: ${name} =`, value);
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfile = () => {
    console.log("[validateProfile] Validating profile data...");
    const requiredFields = ["fullName", "email", "phone", "year", "school", "group"];
    for (const field of requiredFields) {
      if (!profileData[field]?.trim()) {
        console.warn(`[validateProfile] Missing required field: ${field}`);
        setErrorMessage(`Please fill in the required field: ${field}`);
        return false;
      }
    }
    console.log("[validateProfile] All required fields filled.");
    setErrorMessage("");
    return true;
  };

  const handleSave = async () => {
    console.log("[handleSave] Save button clicked.");
    if (!validateProfile()) return;
    if (!user) {
      console.error("[handleSave] No authenticated user.");
      setErrorMessage("No authenticated user.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("[handleSave] Saving profile to Firestore:", profileData);
      await updateUserProfile(user.uid, { ...profileData });
      console.log("[handleSave] Save successful.");
      setSuccessMessage("Profile saved successfully!");
      setInitialData(profileData);
      setHasChanges(false);
    } catch (error) {
      console.error("[handleSave] Save error:", error);
      setErrorMessage("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-overview-container-wrapper">
      <div className="profile-overview-container" role="main" aria-label="User Profile Overview">
        <h2 className="profile-title">Profile Overview</h2>

        <ProfileImage
          uid={user?.uid}
          initialImageUrl={profileData.profileImageUrl}
          onChange={(url) => {
            console.log("[ProfileImage] Updated image URL:", url);
            setProfileData((prev) => ({ ...prev, profileImageUrl: url }));
          }}
        />

        <div className="form-fields-container">
          {[
            { label: "Preffered-Name", name: "username", type: "text" },
            { label: "Full Name*", name: "fullName", type: "text" },
            { label: "Email*", name: "email", type: "email" },
            { label: "Phone*", name: "phone", type: "tel" },
            { label: "Year*", name: "year", type: "text" },
            { label: "School*", name: "school", type: "text" },
            { label: "Group*", name: "group", type: "text" },
            { label: "Residence", name: "residence", type: "text" },
            { label: "Bio", name: "bio", type: "textarea" },
            { label: "Interests", name: "interests", type: "textarea" },
          ].map(({ label, name, type }) => (
            <div className="form-group" key={name}>
              <label className="form-label" htmlFor={name}>{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={name}
                  name={name}
                  className="textarea-field"
                  value={profileData[name]}
                  onChange={handleChange}
                  rows={name === "bio" ? 4 : 3}
                />
              ) : (
                <input
                  id={name}
                  type={type}
                  name={name}
                  className="input-text"
                  value={profileData[name]}
                  onChange={handleChange}
                  aria-required={name !== "nickname"}
                  aria-invalid={errorMessage.includes(name) ? "true" : "false"}
                />
              )}
            </div>
          ))}
        </div>

        <div className="profile-save-section" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            style={{
              backgroundColor: isSaving || !hasChanges ? "#a5b4fc" : "#2563eb",
              color: "white",
              padding: "0.6rem 1.2rem",
              border: "none",
              borderRadius: "6px",
              cursor: isSaving || !hasChanges ? "not-allowed" : "pointer",
              fontSize: "1rem",
              transition: "background-color 0.3s ease",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          {errorMessage && (
            <p style={{ color: "red", marginTop: "0.8rem", fontSize: "0.9rem", fontWeight: "600" }} role="alert">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p style={{ color: "green", marginTop: "0.8rem", fontSize: "0.9rem", fontWeight: "600" }} role="status">
              {successMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
