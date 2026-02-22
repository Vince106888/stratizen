// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { motion } from "framer-motion";

import UserProfile from "../components/Dashboard/UserProfile";
import StatsSummary from "../components/Dashboard/StatsSummary";
import RecentActivity from "../components/Dashboard/RecentActivity";
import Leaderboard from "../components/Dashboard/Leaderboard";
import QuickActions from "../components/Dashboard/QuickActions";
import ChatbotLauncher from "../components/Dashboard/ChatbotLauncher";
import ChatbotModal from "../components/Dashboard/ChatbotModal";

import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    messages: 0,
    forum: 0,
    marketplace: 0,
    xp: 0,
    rank: 999,
  });
  const [recentActivity, setRecentActivity] = useState({
    messages: [],
    forum: [],
    marketplace: [],
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // Framer Motion variants
  // -----------------------------
  const fadeUpVariant = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }),
    [],
  );

  // -----------------------------
  // Fetch recent items helper
  // -----------------------------
  const getRecentItems = useCallback(
    async (collectionName, userId, sortField) => {
      const q = query(
        collection(db, collectionName),
        where("userId", "==", userId),
        orderBy(sortField, "desc"),
      );
      const snap = await getDocs(q);
      const allItems = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return { count: allItems.length, recent: allItems.slice(0, 3) };
    },
    [],
  );

  // -----------------------------
  // Fetch dashboard data
  // -----------------------------
  const fetchData = useCallback(
    async (user) => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        const userInfo = userDocSnap.exists() ? userDocSnap.data() : {};

        const [msgs, forum, market] = await Promise.all([
          getRecentItems(
            `messages/${user.uid}/conversations`,
            user.uid,
            "lastUpdated",
          ),
          getRecentItems("forumTopics", user.uid, "createdAt"),
          getRecentItems("marketplace", user.uid, "createdAt"),
        ]);

        // Dummy leaderboard for now
        const dummyLeaderboard = [
          { id: "1", username: "Alice", xp: 1200, rank: 1 },
          { id: "2", username: "Bob", xp: 1100, rank: 2 },
          { id: "3", username: "Charlie", xp: 1050, rank: 3 },
          { id: "4", username: "David", xp: 980, rank: 4 },
          { id: "5", username: "Eve", xp: 940, rank: 5 },
        ];

        setLeaderboard(dummyLeaderboard);

        setUserData({
          username: userInfo.username || "User",
          bio: userInfo.bio || "No bio provided.",
          purpose: userInfo.purpose || "Just exploring Stratizen!",
          profilePicture:
            userInfo.profilePicture ||
            "https://via.placeholder.com/120?text=No+Image",
        });

        setStats({
          messages: msgs.count,
          forum: forum.count,
          marketplace: market.count,
          xp: userInfo.xp || 0,
          rank: userInfo.rank || 999,
        });

        setRecentActivity({
          messages: msgs.recent,
          forum: forum.recent,
          marketplace: market.recent,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          `Could not load dashboard data: ${err.message || "Unknown error"}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [getRecentItems],
  );

  // -----------------------------
  // Auth listener
  // -----------------------------
  useEffect(() => {
    let lastUid = null;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return navigate("/auth");
      if (user.uid !== lastUid) {
        lastUid = user.uid;
        fetchData(user);
      }
    });
    return unsubscribe;
  }, [fetchData, navigate]);

  /* ------------------------------
   Loading, Error & No Data screens
-------------------------------- */
  function LoadingScreen() {
    return (
      <div
        className="loading-screen flex flex-col justify-center items-center h-64 text-lg gap-2
                  bg-strathmore-light dark:bg-strathmore-dark
                  text-strathmore-blue dark:text-strathmore-light rounded-md p-4"
        role="status"
        aria-live="polite"
      >
        <svg
          className="animate-spin h-10 w-10 text-strathmore-blue dark:text-strathmore-light mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        Loading your dashboard...
      </div>
    );
  }

  function ErrorScreen({ message, onRetry }) {
    return (
      <div
        className="error-screen flex flex-col justify-center items-center h-64 p-6 gap-4
                  bg-red-100 dark:bg-red-900
                  text-red-800 dark:text-red-200 rounded-lg shadow-md border border-red-300 dark:border-red-700"
        role="alert"
        aria-live="assertive"
      >
        <svg
          className="h-12 w-12 text-red-600 dark:text-red-300 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
          />
        </svg>
        <p className="text-center text-base font-semibold">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="retry-btn mt-2 bg-strathmore-blue dark:bg-strathmore-light
                      text-white dark:text-strathmore-dark px-5 py-2 rounded-lg
                      hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-strathmore-blue"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  function NoDataScreen() {
    return (
      <div
        className="no-data-screen flex flex-col justify-center items-center h-64 gap-2
                  bg-strathmore-light dark:bg-strathmore-dark
                  text-strathmore-blue dark:text-strathmore-light rounded-md p-4"
        role="alert"
        aria-live="polite"
      >
        <svg
          className="h-10 w-10 text-strathmore-blue dark:text-strathmore-light mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-3-3v6m6 4H6a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z"
          />
        </svg>
        User data not found.
      </div>
    );
  }
  // -----------------------------
  // Main dashboard render
  // -----------------------------
  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => auth.currentUser && fetchData(auth.currentUser)}
      />
    );
  }

  if (!userData) {
    return <NoDataScreen />;
  }

  return (
    <div
      className={`dashboard-grid min-h-screen p-4 transition-colors duration-300
                  bg-strathmore-light dark:bg-strathmore-dark
                  text-strathmore-blue dark:text-strathmore-light`}
      role="main"
      aria-label="User dashboard"
      aria-busy={loading}
    >
      {/* Left panel */}
      <motion.section
        className="dashboard-left space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
      >
        <UserProfile user={userData} stats={stats} />
        <StatsSummary stats={stats} />
        <RecentActivity activity={recentActivity} />
      </motion.section>

      {/* Right sidebar */}
      <motion.aside
        className="dashboard-right space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        transition={{ delay: 0.2 }}
      >
        <Leaderboard currentUserRank={stats.rank} leaderboard={leaderboard} />
        <QuickActions />
        <ChatbotLauncher onClick={() => setChatbotOpen(true)} />
      </motion.aside>

      {/* Chatbot modal */}
      {chatbotOpen && <ChatbotModal onClose={() => setChatbotOpen(false)} />}
    </div>
  );
}

/* ------------------------------
   Loading, Error & No Data screens
-------------------------------- */
function LoadingScreen() {
  return (
    <div
      className="loading-screen flex justify-center items-center h-64 text-lg
                    bg-strathmore-light dark:bg-strathmore-dark
                    text-strathmore-blue dark:text-strathmore-light"
      role="status"
      aria-live="polite"
    >
      Loading your dashboard...
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div
      className="error-screen flex flex-col justify-center items-center h-64 p-4
                    bg-red-100 dark:bg-red-900
                    text-red-800 dark:text-red-200 rounded-md"
      role="alert"
      aria-live="assertive"
    >
      <p className="mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="retry-btn bg-strathmore-blue dark:bg-strathmore-light
                     text-white dark:text-strathmore-dark px-4 py-2 rounded hover:opacity-90 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function NoDataScreen() {
  return (
    <div
      className="no-data-screen flex justify-center items-center h-64
                    bg-strathmore-light dark:bg-strathmore-dark
                    text-strathmore-blue dark:text-strathmore-light"
      role="alert"
      aria-live="polite"
    >
      User data not found.
    </div>
  );
}
