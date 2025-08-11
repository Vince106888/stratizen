import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import Reactions from "./Reactions";
import CommentsPreview from "./CommentsPreview";
import "../../styles/Stratizen/StratizenFeed.css";

export default function PostItem({ post, currentUser }) {
  const [author, setAuthor] = useState(null);
  const [taggedUsers, setTaggedUsers] = useState([]);

  // Fetch author profile
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!post.authorId) return;
      const docSnap = await getDoc(doc(db, "users", post.authorId));
      if (docSnap.exists()) setAuthor({ uid: post.authorId, ...docSnap.data() });
    };
    fetchAuthor();
  }, [post.authorId]);

  // Fetch tagged users profiles
  useEffect(() => {
    const fetchTaggedUsers = async () => {
      if (!post.tags?.length) return setTaggedUsers([]);
      const usersData = await Promise.all(
        post.tags.map(async (uid) => {
          const docSnap = await getDoc(doc(db, "users", uid));
          return docSnap.exists() ? { uid, ...docSnap.data() } : null;
        })
      );
      setTaggedUsers(usersData.filter(Boolean));
    };
    fetchTaggedUsers();
  }, [post.tags]);

  // Convert URLs in content to clickable links
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

  return (
    <article className="post-item">
      <header className="post-header">
        <strong>{author?.displayName || "Loading..."}</strong>
        <small>
          {" · "}
          {post.createdAt?.toDate
            ? post.createdAt.toDate().toLocaleString()
            : "some time ago"}
        </small>
      </header>

      <section className="post-content">
        {renderContentWithLinks(post.content)}

        {taggedUsers.length > 0 && (
          <p className="post-tags">
            Tagged:{" "}
            {taggedUsers.map((u, i) => (
              <span key={u.uid} className="tagged-user">
                @{u.displayName || "user"}
                {i < taggedUsers.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}

        {post.media?.length > 0 && (
          <div className="post-media">
            {post.media.map((m, i) =>
              m.type === "image" ? (
                <img
                  key={i}
                  src={m.url}
                  alt={`media-${i}`}
                  className="post-media-image"
                />
              ) : m.type === "video" ? (
                <video
                  key={i}
                  controls
                  className="post-media-video"
                  preload="metadata"
                  src={m.url}
                />
              ) : null
            )}
          </div>
        )}
      </section>

      <footer className="post-engagement">
        <Reactions
          reactions={post.reactions || {}}
          postId={post.id}
          currentUser={currentUser}
        />
        <CommentsPreview
          commentsCount={post.commentsCount || 0}
          onClick={() => console.log("Open comments for post", post.id)}
        />
      </footer>
    </article>
  );
}
