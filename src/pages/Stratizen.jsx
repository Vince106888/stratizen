// src/pages/Stratizen.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";

// Components
import PostList from "../components/Stratizen/PostList";
import PostEditor from "../components/Stratizen/PostEditor";
import ClubList from "../components/Stratizen/ClubList";
import GroupList from "../components/Stratizen/GroupList";

// Services
import { getUserProfile } from "../services/db";
import {
  listenToFeed,
  addComment,
  deleteComment,
  addReaction,
  removeReaction,
  deletePost,
} from "../services/stratizenService";

// Styles
import "../styles/Stratizen.css";

const auth = getAuth(app);

const Stratizen = () => {
  const [user, setUser] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("community");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme(); // "light" | "dark"

  /* ==============================
     AUTH STATE WATCH
  ============================== */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  /* ==============================
     FETCH USER PROFILE
  ============================== */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setUserProfile(null);
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setError("Failed to load user profile.");
      }
    };
    fetchProfile();
  }, [user]);

  /* ==============================
     LISTEN TO POSTS (FEED)
  ============================== */
  useEffect(() => {
    if (!userProfile) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }
    setLoadingPosts(true);

    const unsub = listenToFeed((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoadingPosts(false);
    });

    return () => unsub && unsub();
  }, [userProfile]);

  /* ==============================
     HANDLE POST DELETION (persistent)
  ============================== */
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error("Failed to delete post");
    }
  };

  /* ==============================
    HANDLE ADD COMMENT
  ============================== */
  const handleAddComment = async (postId, text) => {
    if (!user || !userProfile) return;
    try {
      const commentId = await addComment(postId, {
        uid: user.uid,
        username: userProfile.username || user.displayName || "Anonymous",
        photoURL: userProfile.photoURL || user.photoURL || "/default-avatar.png",
        text,
        createdAt: new Date(),
      });

      // Optimistic UI update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  {
                    id: commentId,
                    uid: user.uid,
                    username: userProfile.username,
                    photoURL: userProfile.photoURL,
                    text,
                    createdAt: new Date(),
                    reactions: {},
                  },
                ],
              }
            : post
        )
      );

      toast.success("Comment added!");
      return commentId;
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment");
    }
  };

  /* ==============================
    HANDLE REACTIONS (Unified)
  ============================== */
  const handleReact = async (postId, commentId, type, isRemoving = false) => {
    if (!user) return;
    try {
      if (isRemoving) {
        await removeReaction(postId, commentId, user.uid, type);
      } else {
        await addReaction(postId, commentId, user.uid, type);
      }
    } catch (err) {
      console.error("Reaction error:", err);
      toast.error("Failed to update reaction");
    }
  };

  /* ==============================
     HANDLE DELETE COMMENT
  ============================== */
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);
      toast.success("Comment deleted");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment");
    }
  };

  /* ==============================
     RENDER MAIN CONTENT
  ============================== */
  const renderContent = () => {
    switch (activeTab) {
      case "community":
        return (
          <>
            <PostEditor
              currentUser={user}
              currentUserProfile={userProfile}
              onPostCreated={(newPost) =>
                setPosts((prev) => [newPost, ...prev])
              }
            />
            {loadingPosts ? (
              <p>Loading posts...</p>
            ) : (
              <PostList
                posts={posts}
                currentUser={user}
                currentUserProfile={userProfile}
                onDelete={handleDeletePost}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onReact={handleReact}
              />
            )}
          </>
        );
      case "clubs":
        return <ClubList />;
      case "groups":
        return <GroupList />;
      default:
        return <div className="placeholder">🚧 {activeTab} – Coming Soon</div>;
    }
  };

  const menuItems = [
    { key: "search", label: "Search", icon: "🔍" },
    { key: "community", label: "SU Hub", icon: "🌐" },
    { key: "reels", label: "Reels / Videos", icon: "🎥" },
    { key: "trending", label: "Trending", icon: "🔥" },
    { key: "events", label: "Events", icon: "📅" },
    { key: "people", label: "Networking", icon: "🤝" },
    { key: "clubs", label: "Clubs & Societies", icon: "📚" },
    { key: "groups", label: "Groups", icon: "👥" },
    { key: "pages", label: "Pages", icon: "📄" },
    { key: "forum", label: "Forum", icon: "💬" },
    { key: "newsletters", label: "Newsletters", icon: "📰" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  if (error) return <div className="error-message">🚨 {error}</div>;
  if (user === undefined) return <p>Loading Stratizen Hub...</p>;
  if (!user) return <p>Please login to access Stratizen Hub.</p>;
  if (user && userProfile === null)
    return <p>⚠️ No profile found. Please complete your setup.</p>;

  return (
    <div 
      data-theme={theme}
      className={`stratizen-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Left Sidebar */}
      <aside className={`stratizen-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2 className="sidebar-title">Menu</h2>}
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-btn ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
              title={sidebarCollapsed ? item.label : ""}
            >
              <span className="menu-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="menu-text">{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="stratizen-main">
        <div className="stratizen-header">
          <h1>🌐 Stratizen Hub</h1>
        </div>
        {renderContent()}
      </main>

      {/* Right Panel */}
      <aside className="stratizen-rightpanel">
        <div className="rightpanel-section pages">
          <h3>🔥 Trending</h3>
          <ul>
            <li>Strathmore Business School</li>
            <li>Innovation</li>
            <li>#Sports</li>
          </ul>
        </div>
        <div className="rightpanel-section forum">
          <h3>🤝 Network; Discover</h3>
          <ul>
            <li>John Doe</li>
            <li>Alice A</li>
            <li>Bob B</li>
          </ul>
        </div>
        <div className="rightpanel-section events">
          <h3>📅 Upcoming Events</h3>
          <ul>
            <li>Career Fair – Aug 20</li>
            <li>Innovation Week – Sep 5</li>
            <li>Sports Day – Sep 15</li>
          </ul>
        </div>
      </aside>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Stratizen;
