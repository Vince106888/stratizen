// src/components/Profile/ProfileOverview.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/Profile/ProfileOverview.css";

export default function ProfileOverview() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    year: "",
    school: "",
    group: "",
    bio: "",
    interests: "",
    location: "",
    profileImageUrl: "/default-avatar.png", // default placeholder
    coverImageUrl: "/default-cover.jpg",    // default placeholder
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async (uid) => {
    try {
      const ref = doc(db, "users", uid);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setProfileData((prev) => ({ ...prev, ...snapshot.data() }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [db]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchProfile(currentUser.uid);
      }
    });
    return () => unsub();
  }, [auth, navigate, fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadImage = async (file, pathKey) => {
    if (!user || !file) return;
    try {
      const storageRef = ref(storage, `users/${user.uid}/${pathKey}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileData((prev) => ({ ...prev, [pathKey]: url }));
      return url;
    } catch (err) {
      console.error("Image upload error:", err);
      setErrorMessage("Failed to upload image.");
    }
  };

  const removeImage = async (pathKey) => {
    if (!user) return;
    try {
      const storageRef = ref(storage, `users/${user.uid}/${pathKey}`);
      await deleteObject(storageRef);
      const defaultUrl =
        pathKey === "profileImageUrl" ? "/default-avatar.png" : "/default-cover.jpg";
      setProfileData((prev) => ({ ...prev, [pathKey]: defaultUrl }));
    } catch (err) {
      console.error("Error removing image:", err);
    }
  };

  const handleSave = async () => {
    const requiredFields = ["fullName", "email", "phone", "year", "school", "group"];
    const isValid = requiredFields.every((field) => profileData[field]?.trim() !== "");

    if (!isValid) {
      setErrorMessage("Please fill all required (*) fields before saving.");
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("An error occurred while saving. Please try again.");
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  return (
    <div className="profile-overview-container">
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Profile Overview</h2>

      {/* Profile images */}
      <div className="profile-images">
        <div className="profile-avatar-wrapper">
          <img src={profileData.profileImageUrl} alt="Profile" className="profile-avatar" />
          <input
            type="file"
            id="profile-upload"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => uploadImage(e.target.files[0], "profileImageUrl")}
          />
          <label htmlFor="profile-upload" className="avatar-upload-label">✎</label>
          {profileData.profileImageUrl !== "/default-avatar.png" && (
            <button onClick={() => removeImage("profileImageUrl")} className="remove-btn">Remove</button>
          )}
        </div>

        <div className="cover-image-wrapper">
          <img src={profileData.coverImageUrl} alt="Cover" className="cover-image" />
          <input
            type="file"
            id="cover-upload"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => uploadImage(e.target.files[0], "coverImageUrl")}
          />
          <label htmlFor="cover-upload" className="cover-upload-label">Change Cover</label>
          {profileData.coverImageUrl !== "/default-cover.jpg" && (
            <button onClick={() => removeImage("coverImageUrl")} className="remove-btn">Remove</button>
          )}
        </div>
      </div>

      {/* Form fields */}
      {[
        { label: "Full Name*", name: "fullName", type: "text" },
        { label: "Email*", name: "email", type: "email" },
        { label: "Phone*", name: "phone", type: "tel" },
        { label: "Year*", name: "year", type: "text" },
        { label: "School*", name: "school", type: "text" },
        { label: "Group*", name: "group", type: "text" },
      ].map((field) => (
        <div className="form-group" key={field.name}>
          <label className="form-label">{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            className="input-text"
            value={profileData[field.name]}
            onChange={handleChange}
          />
        </div>
      ))}

      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea
          name="bio"
          className="textarea-field"
          value={profileData.bio}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Interests</label>
        <textarea
          name="interests"
          className="textarea-field"
          value={profileData.interests}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          type="text"
          name="location"
          className="input-text"
          value={profileData.location}
          onChange={handleChange}
        />
      </div>

      {/* Save button + messages */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "0.6rem 1.2rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {errorMessage && (
          <p style={{ color: "red", marginTop: "0.8rem", fontSize: "0.9rem" }}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
