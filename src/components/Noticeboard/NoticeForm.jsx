// src/components/Noticeboard/NoticeForm.jsx
import React, { useState } from "react";
import { postNotice } from "../../services/noticeboardService";
import "../../styles/Noticeboard/NoticeForm.css";

export default function NoticeForm({ user, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("User not logged in.");
    if (!title || !content) return setError("Please fill in all fields.");

    setLoading(true);
    setError("");

    try {
      const noticeId = await postNotice(user, {
        title,
        content,
        type: "official",
        audience: { schools: [user.school] },
      });

      setTitle("");
      setContent("");

      if (onSuccess) onSuccess(noticeId); // optional: refresh list
      if (onClose) onClose(); // close the modal
    } catch (err) {
      console.error("Failed to post notice:", err);
      setError("Failed to post notice. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notice-modal-overlay" onClick={onClose}>
      <div
        className="notice-modal-card"
        onClick={e => e.stopPropagation()} // prevent overlay click from closing when clicking inside
      >
        <h3 className="notice-form-title">Post a Notice</h3>

        {error && <p className="notice-form-error">{error}</p>}

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="notice-form-input"
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Content"
          required
          className="notice-form-textarea"
          rows={5}
        />

        <div className="notice-form-actions">
          <button
            type="submit"
            className="notice-form-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Notice"}
          </button>
          <button
            type="button"
            className="notice-form-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
