// src/components/StudyHub/QuestionList.jsx
import React from 'react';
import QuestionCard from './QuestionCard';
import '../../styles/StudyHub/QuestionList.css';

export default function QuestionList({ questions }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="questionlist-empty">
        No questions yet — be the first to ask!
      </div>
    );
  }

  return (
    <div className="questionlist-container">
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </div>
  );
}
