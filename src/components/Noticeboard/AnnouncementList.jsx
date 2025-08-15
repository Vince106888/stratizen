// src/components/Noticeboard/AnnouncementList.jsx
import React from "react";
import "../../styles/Noticeboard/AnnouncementList.css";

export default function AnnouncementList({ announcements = [] }) {
  if (!announcements || announcements.length === 0) {
    return <p className="announcement-empty">No announcements available.</p>;
  }

  // Sort by newest first
  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="announcement-list-container">
      {sortedAnnouncements.map((a) => (
        <div key={a.id} className="announcement-card">
          <h4 className="announcement-title">{a.title}</h4>
          <p className="announcement-description">{a.description}</p>
          <p className="announcement-meta">
            Posted by <span className="poster">{a.postedBy}</span> | 
            Expires: {a.expiry ? new Date(a.expiry).toLocaleDateString() : "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}
