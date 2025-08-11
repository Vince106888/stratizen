// src/components/Profile/ProfileLinks.jsx
import React, { useState, useEffect } from "react";
import {
  FaPlus, FaTimes, FaGlobe, FaLinkedin, FaGithub, FaSchool,
} from "react-icons/fa";
import "../../styles/Profile/ProfileLinks.css";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function ProfileLinks({ form, onChange }) {
  const [personalLinks, setPersonalLinks] = useState(form.personalLinks || []);
  const [editingIndex, setEditingIndex] = useState(null); // track which link is being edited

  useEffect(() => {
    if (!personalLinks.length) {
      setPersonalLinks([
        { id: 1, label: "Microsoft Teams", url: "https://teams.microsoft.com" },
        { id: 2, label: "Google Classroom", url: "https://classroom.google.com" },
      ]);
    }
  }, []);

  useEffect(() => {
    onChange("personalLinks", personalLinks);
  }, [personalLinks]);

  const handleLinkChange = (index, field, value) => {
    setPersonalLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const saveLink = (index) => {
    const link = personalLinks[index];
    if (isValidUrl(link.url) && link.label.trim()) {
      setEditingIndex(null); // exit edit mode
    }
  };

  const addNewLink = () => {
    const newLink = { id: Date.now(), label: "", url: "" };
    setPersonalLinks((prev) => [...prev, newLink]);
    setEditingIndex(personalLinks.length); // immediately edit the new link
  };

  const removeLink = (index) => {
    setPersonalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="profile-links-page">
      {/* Main Links Card */}
      <div className="card">
        <h3 className="section-title">Main Links</h3>
        <div className="grid-2">
          {[
            { id: "website", label: "Personal Website", icon: <FaGlobe /> },
            { id: "linkedin", label: "LinkedIn", icon: <FaLinkedin /> },
            { id: "github", label: "GitHub", icon: <FaGithub /> },
            { id: "schoolPortal", label: "AMS", icon: <FaSchool /> },
          ].map(({ id, label, icon }) => {
            const value = form[id] || "";
            const valid = isValidUrl(value);
            return (
              <div key={id} className="form-group">
                <label className="form-label">{icon} {label}</label>
                {valid ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clickable-link"
                  >
                    {value}
                  </a>
                ) : (
                  <input
                    id={id}
                    type="url"
                    placeholder={`Enter ${label} link`}
                    value={value}
                    onChange={(e) => onChange(e.target.id, e.target.value)}
                    className={`input-text ${value && !valid ? "input-error" : ""}`}
                  />
                )}
                {value && !valid && <small className="error-text">Invalid URL</small>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Links Card */}
      <div className="card">
        <div className="section-header">
          <h3 className="section-title">Personalized Links</h3>
          <button type="button" onClick={addNewLink} className="btn-add-link">
            <FaPlus /> Add Link
          </button>
        </div>

        <div className="personal-links-list">
          {personalLinks.map((link, index) => {
            const valid = isValidUrl(link.url);
            const isEditing = editingIndex === index;

            return (
              <div key={link.id} className="personal-link-row animated-row">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="Name (e.g. My Blog)"
                      value={link.label}
                      onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                      className="input-text personal-link-label"
                    />
                    <input
                      type="url"
                      placeholder="URL (https://example.com)"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                      className={`input-text personal-link-url ${link.url && !valid ? "input-error" : ""}`}
                    />
                    {link.url && !valid && <small className="error-text">Invalid URL</small>}
                    <button
                      type="button"
                      onClick={() => saveLink(index)}
                      className="btn-save-link"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    {valid ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clickable-link"
                      >
                        {link.label || link.url}
                      </a>
                    ) : (
                      <span className="invalid-link-text">{link.label || "Invalid Link"}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="btn-edit-link"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="btn-remove-link"
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
    </div>
  );
}
