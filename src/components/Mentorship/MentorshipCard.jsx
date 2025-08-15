// src/components/Mentorship/MentorshipCard.jsx
import React from "react";
import PropTypes from "prop-types";
import "../../styles/Mentorship/MentorshipCard.css";

export default function MentorshipCard({
  entry,
  currentUser,
  onEdit,
  onDelete,
  onRequestConnection,
  connectionStatus, // null | "pending" | "accepted" | "rejected"
}) {
  const isOwner = currentUser?.uid === entry.userId;

  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "status-accepted";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-rejected";
      default:
        return "";
    }
  };

  return (
    <article
      className="mentorship-card"
      aria-label={`${entry.name}'s ${entry.role} profile`}
    >
      {/* ===== Header ===== */}
      <header className="card-header">
        <div className="card-title-wrapper">
          <h3 className="card-title">
            {entry.name || "Unnamed User"}
            <span
              className={`role-badge role-${entry.role}`}
              aria-label={`Role: ${entry.role}`}
            >
              {entry.role}
            </span>
          </h3>
          {connectionStatus && !isOwner && (
            <span
              className={`status-badge ${getStatusClass(connectionStatus)}`}
              role="status"
            >
              {connectionStatus}
            </span>
          )}
        </div>
        {entry.email && <p className="card-meta">{entry.email}</p>}
      </header>

      {/* ===== Skills ===== */}
      <section className="card-section">
        <h4 className="card-subheading">Skills</h4>
        <p className="card-line">
          {entry.skills?.length
            ? entry.skills.join(", ")
            : "No skills listed"}
        </p>
      </section>

      {/* ===== About ===== */}
      <section className="card-section">
        <h4 className="card-subheading">
          {entry.role === "mentor" ? "Mentoring Philosophy / Bio" : "Goals / Bio"}
        </h4>
        <p className="card-line">
          {entry.description || "No description provided"}
        </p>
      </section>

      {/* ===== Actions ===== */}
      <footer className="card-actions">
        {isOwner ? (
          <>
            <button
              onClick={() => onEdit(entry)}
              className="btn btn-sm btn-secondary"
              aria-label={`Edit profile for ${entry.name}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(entry.id, entry.userId)}
              className="btn btn-sm btn-danger"
              aria-label={`Delete profile for ${entry.name}`}
            >
              Delete
            </button>
          </>
        ) : (
          currentUser &&
          !connectionStatus && (
            <button
              onClick={() => onRequestConnection(entry.userId)}
              className="btn btn-sm btn-primary"
              aria-label={`Request connection with ${entry.name}`}
            >
              Request Connection
            </button>
          )
        )}
      </footer>
    </article>
  );
}

MentorshipCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.string,
    userId: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRequestConnection: PropTypes.func.isRequired,
  connectionStatus: PropTypes.oneOf(["pending", "accepted", "rejected", null]),
};
