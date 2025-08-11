import React from "react";
import "../../styles/Stratizen/CommentsPreview.css";
import "../../styles/Stratizen/PostEngagement.css";

export default function CommentsPreview({ commentsCount = 0, onClick, icon = "💬" }) {
  const label =
    commentsCount === 1
      ? `${commentsCount} Comment`
      : `${commentsCount} Comments`;

  return (
    <button
      className="comments-preview-btn"
      type="button"
      onClick={onClick}
      aria-label={`View ${label}`}
    >
      {icon} {label}
    </button>
  );
}
