// src/components/StudyHub/QuestionItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/StudyHub/QuestionItem.css';

const QuestionItem = ({ question }) => {
  const {
    id,
    content,
    timestamp,
    votes = 0,
    answers = 0,
    userName = "Anonymous",
    tags = [],
  } = question;

  const formattedDate = timestamp?.toDate
    ? new Date(timestamp.toDate()).toLocaleDateString()
    : "Unknown date";

  const userInitials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Link to={`/questions/${id}`} className="questionitem-card">
      <div className="questionitem-header">
        <h2 className="questionitem-content">{content}</h2>
        <span className="questionitem-avatar">{userInitials}</span>
      </div>

      {tags.length > 0 && (
        <div className="questionitem-tags">
          {tags.map((tag) => (
            <span key={tag} className="questionitem-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="questionitem-footer">
        <span className="questionitem-date">📅 {formattedDate}</span>
        <div className="questionitem-stats">
          <span>👍 {votes}</span>
          <span>💬 {answers}</span>
        </div>
      </div>
    </Link>
  );
};

export default QuestionItem;
