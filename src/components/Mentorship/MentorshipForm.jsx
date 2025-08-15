// src/components/Mentorship/MentorshipForm.jsx
import React, { useEffect, useState } from "react";
import "../../styles/Mentorship/MentorshipForm.css";

export default function MentorshipForm({
  user,
  role,
  setRole,
  editingEntry,
  onSubmit,
  onCancelEdit,
}) {
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [descCount, setDescCount] = useState(0);

  useEffect(() => {
    if (editingEntry) {
      setRole(editingEntry.role || "mentor");
      setSkills(
        Array.isArray(editingEntry.skills)
          ? editingEntry.skills.join(", ")
          : ""
      );
      setDescription(editingEntry.description || "");
      setDescCount(editingEntry.description?.length || 0);
    } else {
      setRole((prev) => prev || "mentor");
      setSkills("");
      setDescription("");
      setDescCount(0);
    }
  }, [editingEntry, setRole]);

  const validate = () => {
    if (!user) {
      alert("Please log in first");
      return false;
    }
    if (!skills.trim()) {
      alert("Please enter at least one skill.");
      return false;
    }
    if (description.trim().length < 10) {
      alert("Description should be at least 10 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      userId: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      role,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: description.trim(),
    };

    await onSubmit(payload, editingEntry?.id || null);
  };

  return (
    <form onSubmit={handleSubmit} className="mentorship-form mb-8">
      <h2 className="form-title">
        {role === "mentor" ? "🧑‍🏫 Become a Mentor" : "🎓 Find a Mentor"}
      </h2>

      {/* Role Selector */}
      <div className="form-group">
        <label htmlFor="role" className="form-label">
          I am a:
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field"
        >
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select>
      </div>

      {/* Skills */}
      <div className="form-group">
        <label htmlFor="skills" className="form-label">
          {role === "mentor"
            ? "Skills You Can Offer (comma-separated):"
            : "Skills You Want to Learn (comma-separated):"}
        </label>
        <input
          id="skills"
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="input-field"
          required
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          {role === "mentor"
            ? "Mentoring Philosophy / Bio:"
            : "Your Goals / Bio:"}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescCount(e.target.value.length);
          }}
          className="input-field"
          rows={4}
          required
        />
        <div className="char-counter">{descCount} / 500</div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editingEntry ? "Update My Submission" : `Submit as ${role}`}
        </button>
        {editingEntry && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
