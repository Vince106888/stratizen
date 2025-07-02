import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ messages: 0, forum: 0, marketplace: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userInfo = userDoc.exists() ? userDoc.data() : {};

      const [messagesSnap, forumSnap, marketplaceSnap] = await Promise.all([
        getDocs(collection(db, 'messages', user.uid, 'conversations')),
        getDocs(query(collection(db, 'forumTopics'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'marketplace'), where('userId', '==', user.uid))),
      ]);

      setUserData({
        username: userInfo.username || 'User',
        bio: userInfo.bio || 'No bio provided.',
        purpose: userInfo.purpose || 'Just exploring!',
        profilePic: userInfo.profilePic?.trim()
          ? userInfo.profilePic
          : 'https://via.placeholder.com/100?text=No+Image',
      });

      setStats({
        messages: messagesSnap.size,
        forum: forumSnap.size,
        marketplace: marketplaceSnap.size,
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return navigate('/auth');
      fetchUserData(user);
    });

    return () => unsubscribe();
  }, [fetchUserData, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const StatCard = ({ title, value }) => (
    <div className="dashboard-card p-6 text-center bg-white rounded-xl shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-purple-700">{title}</h3>
      <p className="text-3xl text-purple-900 font-extrabold">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <section className="flex flex-col sm:flex-row items-center gap-6 dashboard-card p-6 mb-8 bg-white rounded-xl shadow-md hover:shadow-lg transition">
          <img
            src={userData.profilePic}
            alt="Profile"
            className="dashboard-profile-img rounded-full w-24 h-24 object-cover shadow"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">{userData.username}</h2>
            <p className="text-gray-600">{userData.bio}</p>
            <p className="text-sm mt-1 italic text-purple-500">{userData.purpose}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Messages" value={stats.messages} />
          <StatCard title="Forum Posts" value={stats.forum} />
          <StatCard title="Marketplace Items" value={stats.marketplace} />
        </section>

        <footer className="dashboard-footer mt-10 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Stratizen. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
