// TopicPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../services/firebase";

const TopicPage = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);

  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const topicRef = collection(db, "forumTopics");
      const topicSnapshot = await getDocs(topicRef);
      const topicData = topicSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(t => t.id === topicId);
      setTopic(topicData);

      const postsRef = collection(db, `forumTopics/${topicId}/posts`);
      const postSnapshot = await getDocs(postsRef);
      const postList = postSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postList);
    };

    fetchData();
  }, [topicId]);

  const handlePost = async () => {
    if (!newPost.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, `forumTopics/${topicId}/posts`), {
        content: newPost,
        createdBy: user.displayName || "Anonymous",
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setNewPost("");
      // Refresh posts
      const postSnapshot = await getDocs(collection(db, `forumTopics/${topicId}/posts`));
      const postList = postSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topic-page">
      <h2>{topic?.title}</h2>
      <div className="post-list">
        {posts.map(post => (
          <div key={post.id} className="post">
            <p>{post.content}</p>
            <span>— {post.createdBy}</span>
          </div>
        ))}
      </div>

      {user && (
        <div className="new-post-section">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write your post here..."
          />
          <button onClick={handlePost} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicPage;
