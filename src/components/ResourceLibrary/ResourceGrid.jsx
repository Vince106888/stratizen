// src/components/ResourceLibrary/ResourceGrid.jsx
import React from "react";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import "../../styles/ResourceLibrary/ResourceGrid.css";

const ResourceGrid = ({ resources, ResourceCard }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="empty-state-container" id="content">
        <div className="empty-state-card">
          <FolderOpenIcon className="empty-state-icon" />
          <p className="empty-state-text">📭 No resources found for the selected filters.</p>
          <span className="empty-state-subtext">
            Try adjusting your filters or adding a new resource.
          </span>
        </div>
      </div>
    );
  }

  return (
    <section id="content" className="resource-grid-section">
      <div className="resource-grid">
        {resources.map((r, idx) => (
          <div
            key={r.id}
            className="resource-card-wrapper"
            style={{ animationDelay: `${idx * 0.07}s` }}
          >
            <ResourceCard resource={r} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResourceGrid;
