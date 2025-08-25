// src/components/Stratizen/PostItem.jsx
import React, { useEffect, useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from "../../services/firebase";
import Reactions from "./Reactions";
import CommentsManager from "./CommentsManager";
import {
  listenToReactions,
  addReaction,
  removeReaction,
} from "../../services/stratizenService";
import "../../styles/Stratizen/PostItem.css";

export default function PostItem({
  post,
  currentUser,
  onDelete,
  onAddComment,
  onReactToComment,
}) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);

  const storage = getStorage();

  // --- Listen to reactions ---
  useEffect(() => {
    if (!post.id) return;
    const unsubscribe = listenToReactions(post.id, ({ users, counts }) => {
      setReactions(counts);
      let current = null;
      for (const type in users) {
        if (users[type].includes(currentUser?.uid)) {
          current = type;
          break;
        }
      }
      setUserReaction(current);
    });
    return () => unsubscribe && unsubscribe();
  }, [post.id, currentUser?.uid]);

  const handleReaction = async (emoji) => {
    try {
      if (!currentUser?.uid) return;
      if (userReaction === emoji) {
        await removeReaction(post.id, currentUser.uid, emoji);
      } else {
        await addReaction(post.id, currentUser.uid, emoji);
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  // --- Delete post + media ---
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      if (post.media?.length) {
        await Promise.all(
          post.media.map(async (m) => {
            try {
              const fileRef = ref(storage, m.url);
              await deleteObject(fileRef);
            } catch (err) {
              console.warn("Failed to delete media:", m.url, err);
            }
          })
        );
      }

      await deleteDoc(doc(db, "posts", post.id));
      onDelete && onDelete(post.id);
      alert("✅ Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("❌ Failed to delete post.");
    }
  };

  // --- Convert URLs in text ---
  const renderContentWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="post-link"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // --- Close image modal on ESC ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedMedia(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <article className="post-item">
      {/* Header */}
      <header className="post-header">
        <div className="post-author">
          <img
            src={
              post.author?.photoURL ||
              post.author?.profilePic ||
              "/default-avatar.png"
            }
            alt={post.author?.username || post.author?.displayName || "User"}
            className="author-avatar"
          />
          <div className="author-details">
            <span className="author-username">
              @{post.author?.username || post.author?.displayName || "user"}
            </span>
            <small className="post-date">
              {post.createdAt?.toDate
                ? post.createdAt.toDate().toLocaleString()
                : "some time ago"}
            </small>
          </div>
        </div>
        {currentUser?.uid === post.authorId && (
          <button className="btn-delete-post" onClick={handleDelete}>
            🗑️ Delete
          </button>
        )}
      </header>

      {/* Content */}
      <section className="post-content">
        {renderContentWithLinks(post.content)}

        {post.tags?.length > 0 && (
          <p className="post-tags">
            Tagged:{" "}
            {post.tags.map((u, i) => (
              <span key={u.uid} className="tagged-user">
                @{u.username || u.displayName || "user"}
                {i < post.tags.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}

        {post.media?.length > 0 && (
          <div className="post-media">
            {post.media.map((m, i) => {
              if (m.type === "image") {
                return (
                  <img
                    key={i}
                    src={m.url}
                    alt={m.alt || `Post image ${i + 1}`}
                    className="post-media-image"
                    loading="lazy"
                    onClick={() => setSelectedMedia(m)}
                  />
                );
              }
              if (m.type === "video") {
                return (
                  <video
                    key={i}
                    controls
                    className="post-media-video"
                    preload="metadata"
                  >
                    <source src={m.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                );
              }
              return null;
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="post-engagement">
        <Reactions
          reactions={reactions}
          userReaction={userReaction}
          onReact={handleReaction}
        />
        <button
          className="comments-icon-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.commentsCount || 0}
        </button>
      </footer>

      {/* Inline Comments */}
      {showComments && (
        <div className="post-comments-popup">
          <CommentsManager
            postId={post.id}
            currentUser={currentUser}
            onAddComment={(c) => onAddComment && onAddComment(c)}
            onReactToComment={(cid, r) =>
              onReactToComment && onReactToComment(cid, r)
            }
            onClose={() => setShowComments(false)}
          />
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {selectedMedia && (
        <div className="media-viewer" onClick={() => setSelectedMedia(null)}>
          <div
            className="media-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMedia.url}
              alt={selectedMedia.alt || "Full view"}
              className="media-viewer-img"
            />
            <button
              className="media-viewer-close"
              onClick={() => setSelectedMedia(null)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
