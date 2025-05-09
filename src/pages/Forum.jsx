import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../services/firebase";
import "../styles/Forum.css";

const db = getFirestore(app);
const auth = getAuth(app);

const Forum = () => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchTopics = async () => {
    const querySnapshot = await getDocs(collection(db, "forumTopics"));
    const topicsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTopics(topicsArray);
  };

  const handleCreateTopic = async () => {
    if (!newTopic.trim()) {
      setError("Please enter a topic name.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/auth");
        return;
      }

      await addDoc(collection(db, "forumTopics"), {
        title: newTopic,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || "Anonymous",
        userId: user.uid,
      });

      setSuccess("Topic created successfully!");
      setNewTopic("");
      fetchTopics();
    } catch (err) {
      setError("Error creating topic: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (topicId) => {
    if (!newPost.trim()) {
      setError("Please write a post.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/auth");
        return;
      }

      await addDoc(collection(db, `forumTopics/${topicId}/posts`), {
        content: newPost,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || "Anonymous",
        userId: user.uid,
      });

      setSuccess("Post added successfully!");
      setNewPost("");
      fetchTopics();
    } catch (err) {
      setError("Error adding post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-container">
      <h2 className="forum-header">Student Forum</h2>

      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="new-topic-section">
        <h3 className="section-title">Create a New Topic</h3>
        <input
          type="text"
          aria-label="New topic name"
          placeholder="Enter the topic name..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="input-field"
        />
        <button
          onClick={handleCreateTopic}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Topic"}
        </button>
      </div>

      <h3 className="section-title">Forum Topics</h3>
      <div className="topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-card">
            <h4 className="topic-title">{topic.title}</h4>
            <p className="topic-meta">Created by {topic.createdBy}</p>
            <button
              onClick={() => navigate(`/forum/${topic.id}`)}
              className="view-posts-link"
            >
              View Posts
            </button>

            <div className="add-post-section">
              <h4 className="post-title">Add a Post</h4>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Write a post..."
                rows="3"
                className="input-field"
              />
              <button
                onClick={() => handleCreatePost(topic.id)}
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
