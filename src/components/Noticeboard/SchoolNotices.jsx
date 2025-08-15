// src/components/Noticeboard/SchoolNotices.jsx
import React, { useState, useEffect } from "react";
import { listenNotices } from "../../services/noticeboardService";
import "../../styles/Noticeboard/SchoolNotices.css";

export default function SchoolNotices({ user, canEdit = false }) {
  const [notices, setNotices] = useState([]);
  const [expandedNotice, setExpandedNotice] = useState(null);

  const handleExpand = (notice) => setExpandedNotice(notice);
  const handleClose = () => setExpandedNotice(null);

  // Fetch official/school notices from DB
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenNotices(user, (allNotices) => {
      const officialSchoolNotices = allNotices.filter(
        (n) => n.type === "school" || n.type === "official"
      );
      setNotices(officialSchoolNotices);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="school-notices-container">
      {notices.length > 0 ? (
        <div className="tiles-grid">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`notice-tile shadow transition-shadow duration-200 cursor-pointer ${
                notice.type === "official"
                  ? "official-tile text-white bg-primary"
                  : "school-tile text-primary border border-primary"
              }`}
              onClick={() => handleExpand(notice)}
            >
              {notice.image ? (
                <div className="notice-image-wrapper">
                  <img
                    src={notice.image}
                    alt={notice.title}
                    className="notice-image"
                  />
                </div>
              ) : (
                <div className="notice-placeholder">📌</div>
              )}
              <h4 className="notice-title">{notice.title}</h4>
              {notice.type && (
                <span
                  className={`notice-badge ${
                    notice.type === "official"
                      ? "official-badge bg-accent text-white"
                      : "school-badge bg-primary text-white"
                  }`}
                >
                  {notice.type.toUpperCase()}
                </span>
              )}
              {canEdit && (
                <button className="edit-btn bg-accent text-white">Edit</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-notices text-gray-500">No official notices yet.</p>
      )}

      {/* Modal */}
      {expandedNotice && (
        <div className="notice-modal">
          <div className="modal-backdrop" onClick={handleClose}></div>
          <div className="modal-content scale-up bg-white shadow-lg rounded-lg">
            <button
              className="modal-close text-primary font-bold"
              onClick={handleClose}
            >
              ×
            </button>
            {expandedNotice.image && (
              <img
                src={expandedNotice.image}
                alt={expandedNotice.title}
                className="modal-image rounded"
              />
            )}
            <h2 className="modal-title text-primary mt-3">
              {expandedNotice.title}
            </h2>
            <p className="modal-description text-dark mt-2">
              {expandedNotice.description}
            </p>
            <p className="notice-meta text-secondary text-sm mt-2">
              Posted by {expandedNotice.postedBy} on{" "}
              {expandedNotice.createdAt?.toDate
                ? expandedNotice.createdAt.toDate().toLocaleDateString()
                : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
