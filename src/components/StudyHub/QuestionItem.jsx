// src/components/StudyHub/QuestionItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/QuestionItem.css'; // Optional if separating styles

const QuestionItem = ({ question }) => {
  const { id, content, timestamp, votes = 0, answers = 0, userName = "Anonymous" } = question;

  const formattedDate = timestamp?.toDate ? new Date(timestamp.toDate()).toLocaleDateString() : "Unknown date";
  const userInitials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <Link to={`/questions/${id}`} className="studyhub-question-item block p-4 border rounded-lg bg-white hover:bg-gray-50 transition shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <h2 className="text-lg font-semibold text-gray-800">{content}</h2>
        <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full">{userInitials}</span>
      </div>
      <div className="text-sm text-gray-500 flex justify-between">
        <span>📅 {formattedDate}</span>
        <div className="flex gap-4">
          <span>👍 {votes} votes</span>
          <span>💬 {answers} answers</span>
        </div>
      </div>
    </Link>
  );
};

export default QuestionItem;
