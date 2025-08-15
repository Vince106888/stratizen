// src/components/StudyHub/QuestionForm.jsx
import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { addQuestion } from '../../services/studyHubService';
import '../../styles/StudyHub/QuestionForm.css';

export default function QuestionForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please add a short title for the question.');

    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const author = user
        ? {
            uid: user.uid,
            displayName: user.displayName || user.email || 'User',
            photoURL: user.photoURL || null,
          }
        : null;

      const tags = (tagsInput || '').split(',').map(t => t.trim()).filter(Boolean);

      await addQuestion({
        title: title.trim(),
        content: content.trim(),
        tags,
        author
      });

      setTitle('');
      setContent('');
      setTagsInput('');
    } catch (err) {
      console.error('QuestionForm error:', err);
      alert('Failed to post question. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="questionform-container">
      <div className="questionform-main">
        <input
          type="text"
          className="questionform-input"
          placeholder="Question title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="questionform-textarea"
          placeholder="More context, code, or details..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          className="questionform-input"
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      <div className="questionform-actions">
        <button type="submit" disabled={loading} className="questionform-submit">
          {loading ? 'Posting…' : 'Post Question'}
        </button>
      </div>
    </form>
  );
}
