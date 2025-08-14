import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaPlus,
  FaTimes,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaGoogleDrive,
} from "react-icons/fa";

import { updateUserProfile, getUserProfile } from "../../services/db"; // <-- added getUserProfile import
import "../../styles/Profile/ProfileLinks.css";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const mainLinksDefault = [
  { id: "website", label: "Personal Website", icon: <FaGlobe /> },
  { id: "linkedin", label: "LinkedIn", icon: <FaLinkedin /> },
  { id: "github", label: "GitHub", icon: <FaGithub /> },
  { id: "googleDrive", label: "Google Drive", icon: <FaGoogleDrive /> },
];

export default function ProfileLinks({ userId }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Initialize empty states until data is fetched
  const [mainLinks, setMainLinks] = useState({
    website: "",
    linkedin: "",
    github: "",
    googleDrive: "",
  });
  const [personalLinks, setPersonalLinks] = useState([]);

  // Keep snapshots to track changes and enable/disable save button
  const [savedMainLinks, setSavedMainLinks] = useState({});
  const [savedPersonalLinks, setSavedPersonalLinks] = useState([]);

  // Editing states
  const [mainEditing, setMainEditing] = useState(null);
  const [personalEditingIndex, setPersonalEditingIndex] = useState(null);

  // Save status
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user profile data once on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setLoadError("User ID is required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserProfile(userId)
      .then((data) => {
        if (data) {
          setMainLinks({
            website: data.website || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            googleDrive: data.googleDrive || "",
          });
          setPersonalLinks(
            data.personalLinks?.length
              ? data.personalLinks
              : [
                  { id: Date.now(), label: "Microsoft Teams", url: "https://teams.microsoft.com" },
                  { id: Date.now() + 1, label: "Google Classroom", url: "https://classroom.google.com" },
                ]
          );
          setSavedMainLinks({
            website: data.website || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            googleDrive: data.googleDrive || "",
          });
          setSavedPersonalLinks(data.personalLinks || []);
        } else {
          // No data, initialize defaults
          setMainLinks({
            website: "",
            linkedin: "",
            github: "",
            googleDrive: "",
          });
          setPersonalLinks([
            { id: Date.now(), label: "Microsoft Teams", url: "https://teams.microsoft.com" },
            { id: Date.now() + 1, label: "Google Classroom", url: "https://classroom.google.com" },
          ]);
          setSavedMainLinks({});
          setSavedPersonalLinks([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setLoadError("Failed to load profile data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  // Detect changes compared to saved snapshots
  const hasMainChanges = useMemo(() => {
    return Object.entries(mainLinks).some(
      ([key, val]) => val !== (savedMainLinks[key] || "")
    );
  }, [mainLinks, savedMainLinks]);

  const hasPersonalChanges = useMemo(() => {
    return JSON.stringify(personalLinks) !== JSON.stringify(savedPersonalLinks);
  }, [personalLinks, savedPersonalLinks]);

  const hasChanges = hasMainChanges || hasPersonalChanges;

  // Main links editing handlers
  const handleMainChange = (field, value) => {
    setMainLinks((prev) => ({ ...prev, [field]: value }));
  };

  const saveMainLink = (field) => {
    const val = mainLinks[field];
    if (!val || isValidUrl(val)) {
      setMainEditing(null);
    }
  };

  // Personal links editing handlers
  const handlePersonalChange = (index, field, value) => {
    setPersonalLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const savePersonalLink = (index) => {
    const link = personalLinks[index];
    if (link.label.trim() && isValidUrl(link.url)) {
      setPersonalEditingIndex(null);
    }
  };

  const addPersonalLink = () => {
    setPersonalLinks((prev) => [
      ...prev,
      { id: Date.now(), label: "", url: "" },
    ]);
    setPersonalEditingIndex(personalLinks.length);
  };

  const removePersonalLink = (index) => {
    setPersonalLinks((prev) => prev.filter((_, i) => i !== index));
    if (personalEditingIndex === index) setPersonalEditingIndex(null);
  };

  // Save all changes to DB
  const handleSaveAll = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateUserProfile(userId, {
        ...mainLinks,
        personalLinks,
      });
      setSavedMainLinks(mainLinks);
      setSavedPersonalLinks(personalLinks);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error saving profile links:", err);
      setSaveError("Failed to save links. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [userId, mainLinks, personalLinks]);

  const disableSave = saving || !hasChanges;

  if (loading) return <p>Loading profile links...</p>;
  if (loadError) return <p className="error-text">{loadError}</p>;

  return (
    <div className="profile-links-page">
      {/* Main Links Card */}
      <div className="card main-links-card">
        <h3 className="section-title">Main Links</h3>
        <div className="grid-responsive">
          {mainLinksDefault.map(({ id, label, icon }) => {
            const val = mainLinks[id] || "";
            const isEditing = mainEditing === id;
            const valid = !val || isValidUrl(val);

            return (
              <div key={id} className="form-group main-link-item">
                <label htmlFor={`main-${id}`} className="form-label">
                  {icon} {label}
                </label>
                {isEditing ? (
                  <>
                    <input
                      id={`main-${id}`}
                      type="url"
                      placeholder={`Enter ${label} link`}
                      value={val}
                      onChange={(e) => handleMainChange(id, e.target.value)}
                      className={`input-text ${val && !valid ? "input-error" : ""}`}
                      aria-invalid={val && !valid}
                      autoFocus
                    />
                    {val && !valid && (
                      <small className="error-text" role="alert">
                        Invalid URL
                      </small>
                    )}
                    <div className="edit-actions">
                      <button
                        type="button"
                        className="btn-save-link"
                        onClick={() => saveMainLink(id)}
                        disabled={!valid}
                        aria-disabled={!valid}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-link"
                        onClick={() => setMainEditing(null)}
                        aria-label={`Cancel editing ${label}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {val && valid ? (
                      <a
                        href={val}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clickable-link"
                        tabIndex={0}
                      >
                        {val}
                      </a>
                    ) : (
                      <span className="invalid-link-text">No link provided</span>
                    )}
                    <button
                      type="button"
                      className="btn-edit-link"
                      onClick={() => setMainEditing(id)}
                      aria-label={`Edit ${label}`}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Links Card */}
      <div className="card personal-links-card">
        <div className="section-header">
          <h3 className="section-title">Personalized Links</h3>
          <button
            type="button"
            onClick={addPersonalLink}
            className="btn-add-link"
            aria-label="Add new personal link"
          >
            <FaPlus /> Add Link
          </button>
        </div>

        <div className="personal-links-list">
          {personalLinks.map((link, index) => {
            const valid = isValidUrl(link.url);
            const isEditing = personalEditingIndex === index;
            const canSave = link.label.trim() && valid;

            return (
              <div key={link.id} className="personal-link-row animated-row">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="Name (e.g. My Blog)"
                      value={link.label}
                      onChange={(e) =>
                        handlePersonalChange(index, "label", e.target.value)
                      }
                      className="input-text personal-link-label"
                      aria-label="Link name"
                      autoFocus
                    />
                    <input
                      type="url"
                      placeholder="URL (https://example.com)"
                      value={link.url}
                      onChange={(e) =>
                        handlePersonalChange(index, "url", e.target.value)
                      }
                      className={`input-text personal-link-url ${
                        link.url && !valid ? "input-error" : ""
                      }`}
                      aria-invalid={link.url && !valid}
                      aria-label="Link URL"
                    />
                    {link.url && !valid && (
                      <small className="error-text" role="alert">
                        Invalid URL
                      </small>
                    )}
                    <div className="edit-actions">
                      <button
                        type="button"
                        onClick={() => savePersonalLink(index)}
                        className="btn-save-link"
                        disabled={!canSave}
                        aria-disabled={!canSave}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-link"
                        onClick={() => setPersonalEditingIndex(null)}
                        aria-label="Cancel editing personal link"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {valid ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clickable-link"
                        tabIndex={0}
                      >
                        {link.label || link.url}
                      </a>
                    ) : (
                      <span className="invalid-link-text">
                        {link.label || "Invalid Link"}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn-edit-link"
                      onClick={() => setPersonalEditingIndex(index)}
                      aria-label={`Edit link ${link.label || index + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-remove-link"
                      onClick={() => removePersonalLink(index)}
                      aria-label={`Remove link ${link.label || index + 1}`}
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="profile-links-save-container">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={disableSave}
          className={`profile-links-save-btn ${disableSave ? "disabled" : ""}`}
          aria-disabled={disableSave}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saveError && <p className="profile-links-save-error">{saveError}</p>}
        {saveSuccess && (
          <p className="profile-links-save-success">Saved successfully! 🎉</p>
        )}
      </div>
    </div>
  );
}
