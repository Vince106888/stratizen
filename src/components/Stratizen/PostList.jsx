import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import PostItem from "./PostItem";
import "../../styles/Stratizen/PostList.css";

const POST_LIMIT = 20;

const PostList = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [newPostCount, setNewPostCount] = useState(0);
  const [checkingNew, setCheckingNew] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

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
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setNewPostCount(0);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const checkForNewPosts = async () => {
    if (!posts.length) return;
    setCheckingNew(true);
    setError(null);
    try {
      const latestTimestamp = posts[0]?.createdAt;
      if (!latestTimestamp) {
        setCheckingNew(false);
        return;
      }
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(POST_LIMIT)
      );
      const snapshot = await getDocs(postsQuery);
      const allDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const countNew = allDocs.filter(
        (p) => p.createdAt?.seconds > latestTimestamp.seconds
      ).length;

      setNewPostCount(countNew);
    } catch (err) {
      setError("Failed to check for new posts.");
      console.error(err);
    }
    setCheckingNew(false);
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  const loadMorePosts = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    setError(null);
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(POST_LIMIT)
      );
      const snapshot = await getDocs(postsQuery);
      const morePosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts((prev) => [...prev, ...morePosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      setError("Failed to load more posts.");
      console.error(err);
    }
    setLoadingMore(false);
  };

  if (loading)
    return (
      <div className="post-list-loading">
        <div className="loader"></div>
        Loading posts...
      </div>
    );

  if (!loading && posts.length === 0)
    return <p className="post-list-empty">No posts found.</p>;

  return (
    <section className="post-list-container">
      <header className="post-list-header">
        <button
          className="btn-check-new"
          onClick={checkForNewPosts}
          disabled={checkingNew}
          aria-live="polite"
        >
          {checkingNew ? "Checking…" : "Check for new posts"}
        </button>
        {newPostCount > 0 && (
          <button className="btn-refresh" onClick={refreshPosts}>
            Refresh ({newPostCount} new)
          </button>
        )}
      </header>

      {error && <p className="post-list-error">{error}</p>}

      <div className="post-list">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} currentUser={user} />
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
