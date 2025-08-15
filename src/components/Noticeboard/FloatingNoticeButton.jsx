// src/components/Noticeboard/FloatingNoticeButton.jsx
import React from "react";
import "../../styles/Noticeboard/FloatingNoticeButton.css";

export default function FloatingNoticeButton({ user, onAdd }) {
  if (!user) return null;

  const isAdmin = ["administrator", "staff", "club_leader"].includes(user.role);
  const label = isAdmin ? "➕ Add Notice/Event" : "📝 Suggest Notice";

  return (
    <button
      className={`floating-notice-btn ${isAdmin ? "admin-btn" : "student-btn"}`}
      onClick={onAdd}
      title={label}
    >
      <span className="btn-icon">{isAdmin ? "➕" : "📝"}</span>
      <span className="btn-text">{isAdmin ? "Add Notice/Event" : "Suggest Notice"}</span>
    </button>
  );
}
