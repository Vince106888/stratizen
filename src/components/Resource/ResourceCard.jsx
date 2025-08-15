import React from "react";
import "../../styles/Resource/ResourceCard.css";

const ResourceCard = ({ resource }) => {
  const { title, description, link, schoolName, subjectName } = resource;

  return (
    <div className="resource-card group">
      <div className="resource-card-header">
        <h3 className="resource-card-title">{title}</h3>
      </div>

      <p className="resource-card-description">{description}</p>

      <div className="resource-card-meta">
        {schoolName && <span className="resource-badge">{schoolName}</span>}
        {subjectName && <span className="resource-badge">{subjectName}</span>}
      </div>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-card-link"
        >
          🔗 View Resource
        </a>
      )}

      {/* Hover Overlay / Action Buttons */}
      <div className="resource-card-overlay group-hover:opacity-100">
        <button className="resource-card-btn">Edit</button>
        <button className="resource-card-btn">Delete</button>
      </div>
    </div>
  );
};

export default ResourceCard;
