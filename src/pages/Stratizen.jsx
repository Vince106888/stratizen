import React, { useEffect, useState, Suspense, lazy } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../services/firebase";
import { useTheme } from "../context/ThemeContext";

// Lazy-loaded Components
const PostList = lazy(() => import("../components/Stratizen/PostList"));
const PostEditor = lazy(() => import("../components/Stratizen/PostEditor"));
const ClubList = lazy(() => import("../components/Stratizen/ClubList"));
const GroupList = lazy(() => import("../components/Stratizen/GroupList"));
const Sidebar = lazy(() => import("../components/Stratizen/Sidebar"));
const SearchBar = lazy(() => import("../components/Stratizen/SearchBar"));

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
  const [userProfile, setUserProfile] = useState(undefined);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("community");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedClubId, setSelectedClubId] = useState(null); // NEW: for feed filtering

  const { theme } = useTheme();

  // ===== Auth state =====
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u?.uid) {
        try {
          const profile = await getUserProfile(u.uid);
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
          setError("Failed to load profile.");
        }
      } else setUserProfile(null);
    });
    return () => unsubscribe();
  }, []);

  // ===== Listen to posts =====
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

  // ===== Handlers =====
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post: " + err.message);
    }
  };

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
      toast.error("Failed to add comment: " + err.message);
    }
  };

  const handleReact = async (postId, commentId, type, isRemoving = false) => {
    if (!user) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      reactions: {
                        ...comment.reactions,
                        [type]: isRemoving
                          ? (comment.reactions[type] || []).filter((uid) => uid !== user.uid)
                          : [...(comment.reactions[type] || []), user.uid],
                      },
                    }
                  : comment
              ),
            }
          : post
      )
    );

    try {
      if (isRemoving) await removeReaction(postId, commentId, user.uid, type);
      else await addReaction(postId, commentId, user.uid, type);
    } catch (err) {
      toast.error("Failed to update reaction: " + err.message);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: (post.comments || []).filter((c) => c.id !== commentId) }
            : post
        )
      );
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Failed to delete comment: " + err.message);
    }
  };

  // ===== Render main content =====
  const renderContent = () => {
    switch (activeTab) {
      case "community":
        return (
          <>
            <Suspense fallback={<div className="loader">Loading editor...</div>}>
              <PostEditor
                currentUser={user}
                currentUserProfile={userProfile}
                onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
              />
            </Suspense>

            {loadingPosts ? (
              <div className="post-skeletons">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="post-skeleton">
                    <div className="skeleton-header" />
                    <div className="skeleton-body" />
                  </div>
                ))}
              </div>
            ) : (
              <Suspense fallback={<div className="loader">Loading posts...</div>}>
                <PostList
                  posts={
                    selectedClubId
                      ? posts.filter((p) => p.clubId === selectedClubId)
                      : posts
                  }
                  currentUser={user}
                  currentUserProfile={userProfile}
                  onDelete={handleDeletePost}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onReact={handleReact}
                />
              </Suspense>
            )}
          </>
        );
      case "clubs":
        return (
          <Suspense fallback={<div className="loader">Loading clubs...</div>}>
            <ClubList />
          </Suspense>
        );
      case "groups":
        return (
          <Suspense fallback={<div className="loader">Loading groups...</div>}>
            <GroupList />
          </Suspense>
        );
      default:
        return <div className="card coming-soon">🚧 {activeTab} – Coming Soon</div>;
    }
  };

  const menuItems = [
    { key: "community", label: "SU Hub", icon: "🌐" },
    { key: "reels", label: "Reels/Videos", icon: "🎥" },
    { key: "trending", label: "Trending", icon: "🔥" },
    { key: "events", label: "Events", icon: "📅" },
    { key: "people", label: "Networking", icon: "🤝" },
    { key: "clubs", label: "Clubs/Societies", icon: "📚" },
    { key: "groups", label: "Groups", icon: "👥" },
    { key: "forum", label: "Forum", icon: "💬" },
    { key: "pages", label: "Pages", icon: "📄" },
    { key: "newsletters", label: "Newsletters", icon: "📰" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  // ===== Error / Loading States =====
  if (error) return <div className="card error">🚨 {error}</div>;
  if (user === undefined || userProfile === undefined) return <p>Loading Stratizen Hub...</p>;
  if (!user) return <p>Please login to access Stratizen Hub.</p>;
  if (user && userProfile === null) return <p>⚠️ No profile found. Please complete your setup.</p>;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme}
        draggable
      />

      <div className={`stratizen-layout ${theme} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Mobile overlay */}
        <div
          className={`sidebar-overlay ${!sidebarCollapsed ? "active" : ""}`}
          onClick={() => setSidebarCollapsed(true)}
        />

        {/* Sidebar */}
        <Suspense fallback={<div className="loader">Loading sidebar...</div>}>
          <Sidebar
            menuItems={menuItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </Suspense>

        {/* Main Panel */}
        <main className="main-panel">
          <header className="main-header">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              🌐 Stratizen Hub
            </h1>
          </header>

          {/* Search Bar */}
          <Suspense fallback={<div className="loader">Loading search...</div>}>
            <SearchBar onSelectClub={setSelectedClubId} />
          </Suspense>

          <div className="main-scrollable">{renderContent()}</div>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <div className="mobile-tab-bar">
          {menuItems.slice(0, 6).map((item) => (
            <button
              key={item.key}
              className={`mobile-tab-btn ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="icon-wrapper">{item.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Stratizen;
