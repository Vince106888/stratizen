import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
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
  const [loading, setLoading] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const fetchData = useCallback(async (user) => {
    setLoading(true);
    setError(null);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userInfo = userDoc.exists() ? userDoc.data() : {};

      const [msgSnap, forumSnap, marketSnap] = await Promise.all([
        getDocs(collection(db, 'messages', user.uid, 'conversations')),
        getDocs(query(collection(db, 'forumTopics'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'marketplace'), where('userId', '==', user.uid))),
      ]);

      const recentMsgSnap = await getDocs(
        query(collection(db, 'messages', user.uid, 'conversations'), orderBy('lastUpdated', 'desc'), limit(3))
      );
      const recentForumSnap = await getDocs(
        query(collection(db, 'forumTopics'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(3))
      );
      const recentMarketSnap = await getDocs(
        query(collection(db, 'marketplace'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(3))
      );

      setUserData({
        username: userInfo.username || 'User',
        bio: userInfo.bio || 'No bio provided.',
        purpose: userInfo.purpose || 'Just exploring Stratizen!',
        profilePic: userInfo.profilePic || 'https://via.placeholder.com/120?text=No+Image',
      });

      setStats({
        messages: msgSnap.size,
        forum: forumSnap.size,
        marketplace: marketSnap.size,
        xp: userInfo.xp || 0,
        rank: userInfo.rank || 999,
      });

      setRecentActivity({
        messages: recentMsgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        forum: recentForumSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        marketplace: recentMarketSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please refresh or try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return navigate('/auth');
      fetchData(user);
    });
    return () => unsubscribe();
  }, [fetchData, navigate]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!userData) return <NoDataScreen />;

  return (
    <div className="dashboard-grid" role="main" aria-label="User dashboard">
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
        <Leaderboard currentUserRank={stats.rank} />
        <QuickActions />
        <ChatbotLauncher onClick={() => setChatbotOpen(true)} />
      </motion.aside>

      {chatbotOpen && <ChatbotModal onClose={() => setChatbotOpen(false)} />}
    </div>
  );
}

// Loading & Error screens

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      Loading your dashboard...
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="error-screen" role="alert" aria-live="assertive">
      {message}
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
