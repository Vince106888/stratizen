// src/components/StudyHub/StudyHubHeader.jsx
import React from 'react';
import '../../styles/StudyHub/studyHubHeader.css';

const StudyHubHeader = ({ searchTerm, setSearchTerm, className }) => {
  return (
    <div className={`studyhub-header-container ${className || ''}`}>
      <div className="studyhub-header-title-wrapper">
        <h1 className="studyhub-header-title">📚 Study Hub</h1>
        <p className="studyhub-header-subtitle">
          Ask questions, share answers, learn together.
        </p>
      </div>

      <div className="studyhub-header-search-wrapper">
        <input
          type="search"
          placeholder="Search questions, content or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="studyhub-header-search"
        />
      </div>
    </div>
  );
};

export default StudyHubHeader;
