// src/pages/Stratizen.jsx
import React, { useEffect, useState, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAuth,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { app } from "../services/firebase";

// Components
import PostList from "../components/Stratizen/PostList";
import PostEditor from "../components/Stratizen/PostEditor";
import ClubList from "../components/Stratizen/ClubList";
import GroupList from "../components/Stratizen/GroupList";
import SearchBar from "../components/Stratizen/SearchBar";

// Styles
import "../styles/Stratizen.css";

const auth = getAuth(app);
const db = getFirestore(app);

const Stratizen = () => {
  const [user, setUser] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("community");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = useCallback(async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      setUserProfile(snap.exists() ? snap.data() : null);
    } catch (err) {
      setError("Failed to load user profile.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile(user.uid);
    } else {
      setUserProfile(null);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    if (!userProfile) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    const postsRef = collection(db, "posts");

    const batchArray = (arr, size) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const createInQueries = (field, arr) =>
      batchArray(arr, 10).map(batch =>
        query(postsRef, where(field, "in", batch), orderBy("createdAt", "desc"), limit(20))
      );

    const queries = [];

    if (userProfile.connections?.length) {
      queries.push(
        ...createInQueries("authorId", userProfile.connections).map(q =>
          query(q, where("visibility", "==", "connections"))
        )
      );
    }

    if (userProfile.clubs?.length) {
      queries.push(
        ...createInQueries("visibility", userProfile.clubs.map(id => `club:${id}`))
      );
    }

    if (userProfile.followedPages?.length) {
      queries.push(
        ...createInQueries("visibility", userProfile.followedPages.map(id => `page:${id}`))
      );
    }

    queries.push(
      query(postsRef, where("visibility", "==", "public"), orderBy("createdAt", "desc"), limit(20))
    );

    const unsubscribes = queries.map(q =>
      onSnapshot(q, (snapshot) => {
        const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts((prev) => {
          const map = new Map();
          [...prev, ...newPosts].forEach(post => map.set(post.id, post));
          return Array.from(map.values()).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        });
        setLoadingPosts(false);
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }, [userProfile]);

  if (error) return <div className="error-message">🚨 {error}</div>;
  if (user === undefined || userProfile === null) return <p>Loading Stratizen Hub...</p>;
  if (!user) return <p>Please login to access Stratizen Hub.</p>;

  const renderContent = () => {
    switch (activeTab) {
      case "community":
        return (
          <>
            <PostEditor currentUser={user} onPostCreated={() => setLoadingPosts(true)} />
            {loadingPosts ? <p>Loading posts...</p> : <PostList posts={posts} currentUser={user} />}
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
    { key: "people", label: "Networking", icon: "🤝" },
    { key: "pages", label: "Pages", icon: "📄" },
    { key: "forum", label: "Forum", icon: "💬" },
    { key: "newsletters", label: "Newsletters", icon: "📰" },
    { key: "reels", label: "Reels / Videos", icon: "🎥" },
    { key: "trending", label: "Trending", icon: "🔥" }, // optional: can keep/remove depending on usage
    { key: "events", label: "Events", icon: "📅" },
    { key: "clubs", label: "Clubs & Societies", icon: "📚" },
    { key: "groups", label: "Groups", icon: "👥" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <div className={`stratizen-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Left Sidebar */}
      <aside className={`stratizen-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2 className="sidebar-title">Menu</h2>}
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(prev => !prev)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
        <div className="sidebar-menu">
          {menuItems.map(item => (
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
