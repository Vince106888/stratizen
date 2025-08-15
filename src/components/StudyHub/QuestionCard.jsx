// src/components/StudyHub/QuestionCard.jsx
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  reactToQuestion,
  reportQuestion,
  reactToAnswer,
  reportAnswer,
  addAnswer
} from '../../services/studyHubService';
import '../../styles/StudyHub/QuestionCard.css';

function timeAgo(ts) {
  if (!ts) return 'just now';
  const date = (typeof ts.toDate === 'function') ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString();
}

export default function QuestionCard({ question }) {
  const auth = getAuth();
  const user = auth.currentUser;

  const [likes, setLikes] = useState(question.likes || 0);
  const [dislikes, setDislikes] = useState(question.dislikes || 0);
  const [userReaction, setUserReaction] = useState(() => {
    if (!user) return null;
    if (question.likedBy?.[user.uid]) return 'like';
    if (question.dislikedBy?.[user.uid]) return 'dislike';
    return null;
  });

  const [answersState, setAnswersState] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLikes(question.likes || 0);
    setDislikes(question.dislikes || 0);

    const init = {};
    (question.answers || []).forEach(ans => {
      init[ans.id] = {
        likes: ans.likes || 0,
        dislikes: ans.dislikes || 0,
        userReaction: !user
          ? null
          : ans.likedBy?.[user.uid]
            ? 'like'
            : ans.dislikedBy?.[user.uid]
              ? 'dislike'
              : null
      };
    });
    setAnswersState(init);
  }, [question, user]);

  /** Handle question reaction */
  const handleQuestionReaction = async (type) => {
    if (!user) return alert('Please sign in to react');
    const prev = userReaction;
    let newLikes = likes;
    let newDislikes = dislikes;

    if (type === 'like') {
      if (prev === 'like') {
        newLikes--;
        setUserReaction(null);
      } else {
        newLikes++;
        if (prev === 'dislike') newDislikes--;
        setUserReaction('like');
      }
    }
    if (type === 'dislike') {
      if (prev === 'dislike') {
        newDislikes--;
        setUserReaction(null);
      } else {
        newDislikes++;
        if (prev === 'like') newLikes--;
        setUserReaction('dislike');
      }
    }

    setLikes(newLikes);
    setDislikes(newDislikes);

    try {
      await reactToQuestion(question.id, user.uid, type);
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  /** Handle answer reaction */
  const handleAnswerReaction = async (answerId, type) => {
    if (!user) return alert('Please sign in to react');
    const prev = answersState[answerId]?.userReaction;
    let newLikes = answersState[answerId]?.likes || 0;
    let newDislikes = answersState[answerId]?.dislikes || 0;

    if (type === 'like') {
      if (prev === 'like') {
        newLikes--;
        answersState[answerId].userReaction = null;
      } else {
        newLikes++;
        if (prev === 'dislike') newDislikes--;
        answersState[answerId].userReaction = 'like';
      }
    }
    if (type === 'dislike') {
      if (prev === 'dislike') {
        newDislikes--;
        answersState[answerId].userReaction = null;
      } else {
        newDislikes++;
        if (prev === 'like') newLikes--;
        answersState[answerId].userReaction = 'dislike';
      }
    }

    setAnswersState({
      ...answersState,
      [answerId]: {
        ...answersState[answerId],
        likes: newLikes,
        dislikes: newDislikes
      }
    });

    try {
      await reactToAnswer(question.id, answerId, user.uid, type);
    } catch (err) {
      console.error('Answer reaction error:', err);
    }
  };

  /** Report question */
  const handleReportQuestion = async () => {
    if (!user) return alert('Please sign in to report');
    if (window.confirm('Are you sure you want to report this question?')) {
      try {
        await reportQuestion(question.id, user.uid);
        alert('Question reported successfully');
      } catch (err) {
        console.error('Report error:', err);
      }
    }
  };

  /** Report answer */
  const handleReportAnswer = async (answerId) => {
    if (!user) return alert('Please sign in to report');
    if (window.confirm('Are you sure you want to report this answer?')) {
      try {
        await reportAnswer(question.id, answerId, user.uid);
        alert('Answer reported successfully');
      } catch (err) {
        console.error('Report answer error:', err);
      }
    }
  };

  /** Post an answer */
  const handlePostAnswer = async () => {
    if (!user) return alert('Please sign in to answer');
    if (!answerContent.trim()) return;
    setPosting(true);
    try {
      await addAnswer(question.id, {
        content: answerContent,
        author: {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null
        }
      });
      setAnswerContent('');
    } catch (err) {
      console.error('Add answer error:', err);
    }
    setPosting(false);
  };

  /** Most voted answer */
  const mostVotedAnswer = (question.answers || [])
    .slice()
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];

  return (
    <article className="question-card">
      <div className="question-header">
        <h3>{question.title}</h3>
        <span>{timeAgo(question.createdAt)}</span>
      </div>

      <p>{question.content}</p>

      {/* Tags */}
      {question.tags?.length > 0 && (
        <div className="question-tags">
          {question.tags.map((tag, idx) => (
            <span key={idx} className="question-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="question-footer">
        <button
          className={`reaction-btn like ${userReaction === 'like' ? 'active' : ''}`}
          onClick={() => handleQuestionReaction('like')}
        >
          👍 {likes}
        </button>
        <button
          className={`reaction-btn dislike ${userReaction === 'dislike' ? 'active' : ''}`}
          onClick={() => handleQuestionReaction('dislike')}
        >
          👎 {dislikes}
        </button>
        <button className="report-btn" onClick={handleReportQuestion}>
          🚩 Report
        </button>
        <span>Asked by {question.author?.displayName || 'Anonymous'}</span>
      </div>

      {/* Most voted answer preview */}
      {mostVotedAnswer && (
        <div className="answer-preview">
          <h4>Top Answer</h4>
          <p>{mostVotedAnswer.content}</p>
          <small>
            👍 {mostVotedAnswer.likes || 0} · {timeAgo(mostVotedAnswer.createdAt)} by {mostVotedAnswer.author?.displayName || 'Anonymous'}
          </small>
        </div>
      )}

      <button className="show-answers-btn" onClick={() => setShowModal(true)}>
        Show all answers ({question.answers?.length || 0})
      </button>

      {/* Post answer form */}
      {user && (
        <div className="answer-form">
          <textarea
            placeholder="Write your answer..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
          />
          <button onClick={handlePostAnswer} disabled={posting}>
            {posting ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      )}

      {/* Modal with all answers */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>All Answers</h3>
            <div className="answers-list">
              {[...(question.answers || [])]
                .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                .map(ans => (
                  <div key={ans.id} className="answer-card">
                    <p>{ans.content}</p>
                    <div className="answer-footer">
                      <button
                        className={`reaction-btn like ${answersState[ans.id]?.userReaction === 'like' ? 'active' : ''}`}
                        onClick={() => handleAnswerReaction(ans.id, 'like')}
                      >
                        👍 {answersState[ans.id]?.likes || 0}
                      </button>
                      <button
                        className={`reaction-btn dislike ${answersState[ans.id]?.userReaction === 'dislike' ? 'active' : ''}`}
                        onClick={() => handleAnswerReaction(ans.id, 'dislike')}
                      >
                        👎 {answersState[ans.id]?.dislikes || 0}
                      </button>
                      <button
                        className="report-btn"
                        onClick={() => handleReportAnswer(ans.id)}
                      >
                        🚩 Report
                      </button>
                      <span>
                        {timeAgo(ans.createdAt)} by {ans.author?.displayName || 'Anonymous'}
                      </span>
                    </div>
                  </div>
              ))}
            </div>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </article>
  );
}
