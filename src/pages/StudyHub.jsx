// src/pages/StudyHub.jsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/StudyHub.css';
import StudyHubHeader from '../components/StudyHub/StudyHubHeader';
import QuestionForm from '../components/StudyHub/QuestionForm';
import QuestionList from '../components/StudyHub/QuestionList';
import QuestionItem from '../components/StudyHub/QuestionItem';
import { subscribeToQuestions } from '../services/studyHubService';

const StudyHub = () => {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Subscribe to questions updates
  useEffect(() => {
    const unsubscribe = subscribeToQuestions((questionsArr) => {
      setQuestions(questionsArr);
    });
    return () => unsubscribe();
  }, []);

  // Filter questions based on search term
  const filteredQuestions = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (question) =>
        (question.title || '').toLowerCase().includes(q) ||
        (question.content || '').toLowerCase().includes(q) ||
        (question.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [questions, searchTerm]);

  // Example FAQ for side panel
  const faqs = [
    { q: "How do I ask a good question?", a: "Provide a clear title, context, and tags." },
    { q: "Can I edit my question?", a: "Yes, use the edit button on your question card." },
    { q: "How do votes work?", a: "Upvote helpful questions; downvote unclear ones." },
    { q: "Can I answer multiple questions?", a: "Absolutely! Share your knowledge freely." },
  ];

  return (
    <main className="studyhub-container grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Main Content */}
      <section className="lg:col-span-2 flex flex-col gap-6">
        {/* Header */}
        <StudyHubHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Question Form */}
        <QuestionForm />

        {/* Divider */}
        <hr className="studyhub-hr" />

        {/* Questions List */}
        <QuestionList questions={filteredQuestions} />
      </section>

      {/* Side Panel - Only on large screens */}
      <aside className="hidden lg:block sticky top-4 self-start">
        <div className="bg-white shadow-md rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold mb-2 text-primary">💡 Did you know?</h3>
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item border-b border-gray-200 pb-2 mb-2 last:border-b-0 last:mb-0">
              <p className="text-sm font-medium text-gray-700">Q: {faq.q}</p>
              <p className="text-sm text-gray-500">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
};

export default StudyHub;
