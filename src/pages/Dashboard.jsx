// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { motion } from 'framer-motion';

import UserProfile from '../components/Dashboard/UserProfile';
import StatsSummary from '../components/Dashboard/StatsSummary';
import RecentActivity from '../components/Dashboard/RecentActivity';
import Leaderboard from '../components/Dashboard/Leaderboard';
import QuickActions from '../components/Dashboard/QuickActions';
import ChatbotLauncher from '../components/Dashboard/ChatbotLauncher';
import ChatbotModal from '../components/Dashboard/ChatbotModal';

import '../styles/Dashboard.css';

export default function Dashboard() {
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

  const navigate = useNavigate();

  const fadeUpVariant = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }),
    []
  );

  /** Fetch recent items from a given collection */
  const getRecentItems = useCallback(async (collectionName, userId, sortField) => {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy(sortField, 'desc')
    );

    const snap = await getDocs(q);
    const allItems = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return {
      count: allItems.length,
      recent: allItems.slice(0, 3),
    };
  }, []);

  /** Fetch dashboard data */
  const fetchData = useCallback(async (user) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const userDocSnap = await getDoc(doc(db, 'users', user.uid));
      const userInfo = userDocSnap.exists() ? userDocSnap.data() : {};

      // Fetch activity data in parallel
      const [msgs, forum, market] = await Promise.all([
        getRecentItems(`messages/${user.uid}/conversations`, user.uid, 'lastUpdated'),
        getRecentItems('forumTopics', user.uid, 'createdAt'),
        getRecentItems('marketplace', user.uid, 'createdAt'),
      ]);

      // Dummy leaderboard for now
      const dummyLeaderboard = [
        { id: '1', username: 'Alice', xp: 1200, rank: 1 },
        { id: '2', username: 'Bob', xp: 1100, rank: 2 },
        { id: '3', username: 'Charlie', xp: 1050, rank: 3 },
        { id: '4', username: 'David', xp: 980, rank: 4 },
        { id: '5', username: 'Eve', xp: 940, rank: 5 },
      ];
      setLeaderboard(dummyLeaderboard);

      setUserData({
        username: userInfo.username ?? 'User',
        bio: userInfo.bio ?? 'No bio provided.',
        purpose: userInfo.purpose ?? 'Just exploring Stratizen!',
        profilePic:
          userInfo.profilePic ?? 'https://via.placeholder.com/120?text=No+Image',
      });

      setStats({
        messages: msgs.count,
        forum: forum.count,
        marketplace: market.count,
        xp: userInfo.xp ?? 0,
        rank: userInfo.rank ?? 999,
      });

      setRecentActivity({
        messages: msgs.recent,
        forum: forum.recent,
        marketplace: market.recent,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(`⚠️ Could not load dashboard data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [getRecentItems]);

  /** Listen for auth changes */
  useEffect(() => {
    let lastUid = null;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return navigate('/auth');
      if (user.uid !== lastUid) {
        lastUid = user.uid;
        fetchData(user);
      }
    });
    return unsubscribe;
  }, [fetchData, navigate]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => fetchData(auth.currentUser)} />;
  if (!userData) return <NoDataScreen />;

  return (
    <div
      className="dashboard-grid"
      role="main"
      aria-label="User dashboard"
      aria-busy={loading}
    >
      {/* Left panel */}
      <motion.section
        className="dashboard-left"
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
        className="dashboard-right"
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        transition={{ delay: 0.2 }}
      >
        <Leaderboard currentUserRank={stats.rank} leaderboard={leaderboard} />
        <QuickActions />
        <ChatbotLauncher onClick={() => setChatbotOpen(true)} />
      </motion.aside>

      {chatbotOpen && <ChatbotModal onClose={() => setChatbotOpen(false)} />}
    </div>
  );
}

/* ------------------------------
   Loading, Error & No Data screens
-------------------------------- */
function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      Loading your dashboard...
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="error-screen" role="alert" aria-live="assertive">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          Retry
        </button>
      )}
    </div>
  );
}

function NoDataScreen() {
  return (
    <div className="no-data-screen" role="alert" aria-live="polite">
      User data not found.
    </div>
  );
}
