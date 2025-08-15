// src/components/Mentorship/MentorshipList.jsx
import React from "react";
import MentorshipCard from "./MentorshipCard";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import "../../styles/Mentorship/MentorshipList.css"; // Make sure to import the updated CSS

export default function MentorshipList({
  title,
  submissions = [],
  currentUser,
  onEdit,
  onDelete,
  onRequestConnection,
  getStatusFor, // (targetUserId) => null | status
}) {
  return (
    <section
      className="mentorship-list-container"
      aria-labelledby={`${title}-heading`}
    >
      {/* ===== Section Header ===== */}
      <header className="mentorship-list-header">
        <h2 id={`${title}-heading`} className="section-title">
          {title}
        </h2>
        <span className="result-count">
          {submissions.length}{" "}
          {submissions.length === 1 ? "profile" : "profiles"}
        </span>
      </header>

      {/* ===== Content ===== */}
      <div className="topics-list">
        {submissions.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="empty-message">No profiles found.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {submissions.map((entry, index) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <MentorshipCard
                  entry={entry}
                  currentUser={currentUser}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRequestConnection={onRequestConnection}
                  connectionStatus={getStatusFor?.(entry.userId)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

MentorshipList.propTypes = {
  title: PropTypes.string.isRequired,
  submissions: PropTypes.arrayOf(PropTypes.object),
  currentUser: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onRequestConnection: PropTypes.func,
  getStatusFor: PropTypes.func,
};
