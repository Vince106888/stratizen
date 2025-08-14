// src/components/Profile/ProfileImage.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { uploadUserImage, deleteUserImage } from "../../services/storage";
import { updateUserProfile, getUserProfile } from "../../services/db"; // Make sure getUserProfile exists!
import "../../styles/Profile/ProfileImage.css";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ProfileImage({ uid, nickname, initialImageUrl, onChange }) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch profilePicture from backend on mount or uid change
  useEffect(() => {
    async function fetchProfilePicture() {
      if (!uid) return;
      try {
        const profile = await getUserProfile(uid);
        if (profile && profile.profilePicture) {
          setImageUrl(profile.profilePicture);
        } else {
          setImageUrl(""); // no profile picture
        }
      } catch (err) {
        console.error("Failed to fetch profile picture", err);
        setImageUrl(initialImageUrl || "");
      }
    }
    fetchProfilePicture();
  }, [uid, initialImageUrl]);

  // ... rest of your helper functions unchanged ...

  const getInitials = () => {
    if (nickname && nickname.trim()) {
      const parts = nickname.trim().split(" ");
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (!uid) return "U";
    const parts = uid.split(/[\s@.]+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getRandomPastelColor = (seed) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };

  const initialsBgColor = getRandomPastelColor(uid || "U");

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Invalid file type. Only JPG, PNG, GIF, WEBP allowed.";
    if (file.size > MAX_IMAGE_SIZE_BYTES) return "File too large. Max size is 2MB.";
    return null;
  };

  const handleFileChange = (e) => {
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress(0);
    const file = e.target.files[0];
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = null;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!uid) {
      setErrorMessage("User ID not available.");
      return;
    }
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress(0);
    try {
      const url = await uploadUserImage(uid, selectedFile, "profilePicture", (progress) => {
        setUploadProgress(progress);
      });
      await updateUserProfile(uid, { profilePicture: url });
      setImageUrl(url);
      setSelectedFile(null);
      setPreviewUrl("");
      setSuccessMessage("Profile image updated successfully!");
      if (typeof onChange === "function") onChange(url);
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage("Failed to upload image. Try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleRemoveImage = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!uid) {
      setErrorMessage("User ID not available.");
      return;
    }
    try {
      await deleteUserImage(uid, "profilePicture");
      await updateUserProfile(uid, { profilePicture: "" });
      setImageUrl("");
      setSuccessMessage("Profile image removed.");
      if (typeof onChange === "function") onChange("");
    } catch (err) {
      console.error("Remove image failed:", err);
      setErrorMessage("Failed to remove image. Try again.");
    }
  };

  return (
    <div className="profile-images" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {previewUrl ? (
        <img src={previewUrl} alt="Image preview" className="profile-avatar" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="Profile avatar" className="profile-avatar" />
      ) : (
        <div
          className="initials-avatar"
          aria-label="User initials avatar"
          style={{ backgroundColor: initialsBgColor }}
        >
          {getInitials()}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          id="profile-image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="profile-image-upload"
          className="icon-button edit-button"
          tabIndex={0}
          aria-label="Choose new profile image"
          style={{ width: 36, height: 36, fontSize: "1.3rem", cursor: uploading ? "not-allowed" : "pointer" }}
        >
          &#9998;
        </label>

        {previewUrl && (
          <>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="upload-button"
              style={{ padding: "6px 12px", fontSize: "0.9rem", cursor: uploading ? "not-allowed" : "pointer" }}
            >
              {uploading ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Uploading... {uploadProgress}%
                </>
              ) : (
                "Upload"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={uploading}
              style={{ padding: "6px 12px", fontSize: "0.9rem", cursor: "pointer" }}
            >
              Cancel
            </button>

            {uploading && (
              <progress
                value={uploadProgress}
                max="100"
                style={{ width: "100%", marginTop: "0.25rem", height: "6px", borderRadius: "4px" }}
                aria-label={`Upload progress: ${uploadProgress}%`}
              />
            )}
          </>
        )}

        {!previewUrl && imageUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="icon-button remove-button"
            aria-label="Remove profile image"
            style={{ width: 36, height: 36, fontSize: "1.5rem" }}
            disabled={uploading}
          >
            &times;
          </button>
        )}
      </div>

      {(errorMessage || successMessage) && (
        <div style={{ marginLeft: "1rem", fontSize: "0.9rem", minWidth: "200px" }}>
          {errorMessage && (
            <p style={{ color: "red" }} role="alert">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p style={{ color: "green" }} role="status">
              {successMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

ProfileImage.propTypes = {
  uid: PropTypes.string.isRequired,
  nickname: PropTypes.string,
  initialImageUrl: PropTypes.string,
  onChange: PropTypes.func,
};
