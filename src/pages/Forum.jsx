import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../services/firebase";
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";

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

  const fetchTopics = async () => {
    const querySnapshot = await getDocs(collection(db, "forumTopics"));
    const topicsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        window.location.href = "/auth";
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
        window.location.href = "/auth";
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
    <div className="max-w-4xl mx-auto bg-white p-8 mt-10 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Student Forum</h2>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Create a New Topic</h3>
        <input
          type="text"
          placeholder="Enter the topic name..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="w-full p-4 border rounded-lg mb-2"
        />
        <button
          onClick={handleCreateTopic}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Topic"}
        </button>
      </div>

      <h3 className="text-2xl font-semibold mb-4">Forum Topics</h3>
      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="p-4 border rounded-lg shadow-md">
            <h4 className="text-xl font-semibold">{topic.title}</h4>
            <p className="text-gray-500">Created by {topic.createdBy}</p>
            <button
              onClick={() => navigate(`/forum/${topic.id}`)}
              className="mt-2 text-blue-600 hover:underline"
            >
              View Posts
            </button>

            <div className="mt-4">
              <h4 className="text-lg font-semibold">Add a Post</h4>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Write a post..."
                rows="3"
                className="w-full p-4 border rounded-lg mt-2"
              />
              <button
                onClick={() => handleCreatePost(topic.id)}
                className="bg-green-600 text-white px-6 py-2 mt-2 rounded hover:bg-green-800 transition"
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
