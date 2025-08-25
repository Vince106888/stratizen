// src/components/Stratizen/PostList.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import PostItem from "./PostItem";
import "../../styles/Stratizen/PostList.css";

const POST_LIMIT = 20;

const PostList = ({
  currentUser,
  refreshKey, // parent passes a changing value to trigger refresh
  onAddComment,
  onReactToComment,
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [newPostCount, setNewPostCount] = useState(0);
  const [checkingNew, setCheckingNew] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // --- Helper: enrich post with user profile ---
  const enrichWithUser = async (rawPosts) => {
    const enriched = await Promise.all(
      rawPosts.map(async (p) => {
        if (!p.userId) return p;
        try {
          const userDoc = await getDoc(doc(db, "users", p.userId));
          if (userDoc.exists()) {
            const { username, photoURL } = userDoc.data();
            return {
              ...p,
              authorName: username || "Unknown",
              authorPhoto: photoURL || null,
            };
          }
        } catch (err) {
          console.warn("Failed to fetch user for post:", p.id, err);
        }
        return {
          ...p,
          authorName: "Unknown",
          authorPhoto: null,
        };
      })
    );
    return enriched;
  };

  // --- Initial + refresh fetch ---
  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);

  /** --- Fetch first page --- */
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(POST_LIMIT)
      );
      const snapshot = await getDocs(postsQuery);
      const rawPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const enriched = await enrichWithUser(rawPosts);

      setPosts(enriched);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setNewPostCount(0);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts. Please try again.");
    }
    setLoading(false);
  };

  /** --- Check if newer posts exist --- */
  const checkForNewPosts = async () => {
    if (!posts.length) return;
    setCheckingNew(true);
    try {
      const latestTimestamp = posts[0]?.createdAt;
      if (!latestTimestamp) return;

      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(POST_LIMIT)
      );
      const snapshot = await getDocs(postsQuery);
      const rawPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const countNew = rawPosts.filter(
        (p) => p.createdAt?.seconds > latestTimestamp.seconds
      ).length;

      setNewPostCount(countNew);
    } catch (err) {
      console.error(err);
      setError("Failed to check for new posts.");
    } finally {
      setCheckingNew(false);
    }
  };

  /** --- Load more (pagination) --- */
  const loadMorePosts = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(POST_LIMIT)
      );
      const snapshot = await getDocs(postsQuery);
      const rawPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const enriched = await enrichWithUser(rawPosts);

      setPosts((prev) => [...prev, ...enriched]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load more posts.");
    }
    setLoadingMore(false);
  };

  /** --- Delete locally --- */
  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  /** --- Optimistic comment reaction --- */
  const handleReactToComment = (postId, commentId, type) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments?.map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      reactions: {
                        ...c.reactions,
                        [type]: (c.reactions?.[type] || 0) + 1,
                      },
                    }
                  : c
              ),
            }
          : post
      )
    );
    onReactToComment?.(postId, commentId, type); // sync with parent/DB
  };

  // ---- RENDER ----
  if (loading) {
    return (
      <div className="post-list-loading">
        <div className="loader"></div>
        Loading posts...
      </div>
    );
  }

  if (!posts.length) {
    return <p className="post-list-empty">No posts found.</p>;
  }

  return (
    <section className="post-list-container">
      {/* Floating check for new posts */}
      <div className="floating-new-post-btn">
        <button
          className="btn-check-new"
          onClick={checkForNewPosts}
          disabled={checkingNew}
        >
          {checkingNew
            ? "Checking…"
            : newPostCount > 0
            ? `🔔 ${newPostCount} New`
            : "🔔 New"}
        </button>
        {newPostCount > 0 && (
          <button className="btn-refresh" onClick={fetchPosts}>
            Refresh
          </button>
        )}
      </div>

      {error && <p className="post-list-error">{error}</p>}

      <div className="post-list">
        {posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={handleDeletePost}
            onAddComment={(text) => onAddComment(post.id, text)}
            onReactToComment={(commentId, type) =>
              handleReactToComment(post.id, commentId, type)
            }
          />
        ))}
      </div>

      {lastDoc && (
        <div className="load-more-container">
          <button
            className="btn-load-more"
            onClick={loadMorePosts}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default PostList;
