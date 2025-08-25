// src/components/Stratizen/CommentsManager.jsx
import React, { useEffect, useState } from "react";
import "../../styles/Stratizen/CommentsManager.css";
import {
  listenToComments,
  addComment,
  deleteComment,
  addReaction,
  removeReaction,
} from "../../services/stratizenService";
import Reactions from "./Reactions";

const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/?d=mp&f=y"; // ✅ fallback image

export default function CommentsManager({
  postId,
  currentUser,
  onClose,
  onAddComment,
  onReactToComment,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 🔁 Listen to comments in real-time
  useEffect(() => {
    if (!postId) return;
    const unsubscribe = listenToComments(postId, (fetchedComments) => {
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [postId]);

  // ➕ Add new comment
  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const commentId = await addComment(postId, currentUser.uid, newComment);
      onAddComment &&
        onAddComment({
          id: commentId,
          text: newComment,
          userId: currentUser.uid,
          author: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
        });
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("❌ Failed to add comment.");
    }
  };

  // 🗑️ Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(postId, commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("❌ Failed to delete comment.");
    }
  };

  // 😊 Toggle reaction on a comment
  const handleReact = async (commentId, reactionType, isActive) => {
    if (!currentUser) return;
    try {
      if (isActive) {
        await removeReaction(postId, commentId, reactionType);
      } else {
        await addReaction(postId, commentId, currentUser.uid, reactionType);
      }
      onReactToComment && onReactToComment(commentId, reactionType);
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  return (
    <div className="comments-popup">
      {/* Header */}
      <div className="comments-header">
        <h4>Comments</h4>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}

        {comments.map((c) => {
          const userReaction =
            Object.keys(c.reactions || {}).find((type) =>
              c.reactions[type]?.includes(currentUser?.uid)
            ) || null;

          const reactionCounts = Object.fromEntries(
            Object.entries(c.reactions || {}).map(([type, users]) => [
              type,
              users.length,
            ])
          );

          const authorName =
            c.author?.displayName || c.userId || "Anonymous";
          const authorPhoto = c.author?.photoURL || DEFAULT_AVATAR;

          return (
            <div key={c.id} className="comment-item">
              {/* 👤 Avatar + Name */}
              <div className="comment-meta">
                <img
                  src={authorPhoto}
                  alt={authorName}
                  className="comment-avatar"
                />
                <span className="comment-author">{authorName}</span>
              </div>

              {/* 💬 Text */}
              <div className="comment-body">
                <span className="comment-text">{c.text}</span>

                {/* 😊 Reactions */}
                <Reactions
                  userReaction={userReaction}
                  reactionCounts={reactionCounts}
                  onReact={(type, isActive) =>
                    handleReact(c.id, type, isActive)
                  }
                />

                {/* 🗑️ Delete */}
                {currentUser?.uid === c.userId && (
                  <button
                    className="btn-delete-post"
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✍️ New Comment */}
      <form className="comment-form" onSubmit={handleAddComment}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
        />
        <button type="submit" className="comment-submit-btn">
          Post
        </button>
      </form>
    </div>
  );
}
