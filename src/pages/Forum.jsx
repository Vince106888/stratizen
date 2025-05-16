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
  const [newPost, setNewPost] = useState({});
  const [newTag, setNewTag] = useState("General");
  const [anonymousTopic, setAnonymousTopic] = useState(false);
  const [anonymousPost, setAnonymousPost] = useState({});
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
        tag: newTag,
        createdAt: serverTimestamp(),
        createdBy: anonymousTopic ? "Anonymous" : user.displayName || "User",
        userId: user.uid,
      });

      setSuccess("Topic created successfully!");
      setNewTopic("");
      setNewTag("General");
      setAnonymousTopic(false);
      fetchTopics();
    } catch (err) {
      setError("Error creating topic: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (topicId) => {
    if (!newPost[topicId] || !newPost[topicId].trim()) {
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
        content: newPost[topicId],
        createdAt: serverTimestamp(),
        createdBy: anonymousPost[topicId] ? "Anonymous" : user.displayName || "User",
        userId: user.uid,
      });

      setSuccess("Post added successfully!");
      setNewPost((prev) => ({ ...prev, [topicId]: "" }));
      setAnonymousPost((prev) => ({ ...prev, [topicId]: false }));
      fetchTopics();
    } catch (err) {
      setError("Error adding post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportPost = (topicId, postId) => {
    // Placeholder for now. Implement in Firestore later.
    alert(`Post ${postId} under Topic ${topicId} has been reported.`);
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
          placeholder="Enter topic title..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="input-field"
        />
        <select
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="input-field"
        >
          <option value="General">General</option>
          <option value="Help">Help</option>
          <option value="Advice">Advice</option>
          <option value="Celebration">Celebration</option>
          <option value="Struggle">Struggle</option>
          <option value="Academic">Academic</option>
          <option value="Wellness">Wellness</option>
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={anonymousTopic}
            onChange={() => setAnonymousTopic(!anonymousTopic)}
          />
          Post as Anonymous
        </label>
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
            <p className="topic-meta">
              <span className="badge">{topic.tag || "General"}</span> &nbsp;
              Created by {topic.createdBy}
            </p>
            <button
              onClick={() => navigate(`/forum/${topic.id}`)}
              className="view-posts-link"
            >
              View Posts
            </button>

            <div className="add-post-section">
              <h4 className="post-title">Add a Post</h4>
              <textarea
                value={newPost[topic.id] || ""}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, [topic.id]: e.target.value }))
                }
                placeholder="Write your post..."
                rows="3"
                className="input-field"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={anonymousPost[topic.id] || false}
                  onChange={() =>
                    setAnonymousPost((prev) => ({
                      ...prev,
                      [topic.id]: !prev[topic.id],
                    }))
                  }
                />
                Post Anonymously
              </label>
              <button
                onClick={() => handleCreatePost(topic.id)}
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post"}
              </button>
              {/* Placeholder: You can later fetch posts and list them here */}
              <button
                className="report-button"
                onClick={() => handleReportPost(topic.id, "dummyPostId")}
              >
                Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
