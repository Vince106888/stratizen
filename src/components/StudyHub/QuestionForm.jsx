import React, { useState } from 'react';

const QuestionForm = ({ onSubmit }) => {
  const [newQuestion, setNewQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newQuestion.trim() === '') return;
    onSubmit(newQuestion.trim());
    setNewQuestion('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        placeholder="Type your question here..."
        className="studyhub-form-textarea"
        rows={4}
      />
      <button type="submit" className="studyhub-form-button">
        Post Question
      </button>
    </form>
  );
};

export default QuestionForm;
