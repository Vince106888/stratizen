import React, { useEffect, useState } from 'react';
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, collection, getDoc, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    messages: 0,
    forum: 0,
    marketplace: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        const userInfo = userSnap.exists() ? userSnap.data() : {};

        const [messagesSnap, forumSnap, marketplaceSnap] = await Promise.all([
          getDocs(collection(db, 'messages', user.uid, 'conversations')),
          getDocs(collection(db, 'forum', user.uid, 'posts')),
          getDocs(collection(db, 'marketplace', user.uid, 'items')),
        ]);

        setUserData({
          username: userInfo.username || 'User',
          bio: userInfo.bio || 'No bio provided.',
          purpose: userInfo.purpose || 'Just exploring!',
          profilePic: userInfo.profilePic || 'https://via.placeholder.com/80',
        });

        setStats({
          messages: messagesSnap.size,
          forum: forumSnap.size,
          marketplace: marketplaceSnap.size,
        });
      } catch (error) {
        console.error('Dashboard Load Error:', error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white w-64 p-6 shadow-md fixed z-20 inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-purple-800">Stratizen</h2>
          <button className="sm:hidden text-purple-600" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="space-y-4">
          {[
            { to: '/profile', label: 'Profile' },
            { to: '/forum', label: 'Forum' },
            { to: '/messages', label: 'Messages' },
            { to: '/marketplace', label: 'Marketplace' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="block text-gray-700 hover:text-purple-700 transition font-medium">
              {label}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-red-500 font-semibold hover:text-red-700">
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:ml-64 w-full">
        <button
          onClick={() => setSidebarOpen(true)}
          className="sm:hidden text-purple-600 text-2xl mb-4"
        >
          ☰
        </button>

        <section className="flex items-center gap-6 bg-white shadow-md rounded-xl p-6 mb-8">
          <img
            src={userData.profilePic}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-purple-300"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{userData.username}</h2>
            <p className="text-gray-600">{userData.bio}</p>
            <p className="text-sm mt-1 italic text-purple-500">{userData.purpose}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: 'Messages', value: stats.messages },
            { title: 'Forum Posts', value: stats.forum },
            { title: 'Marketplace Items', value: stats.marketplace },
          ].map(({ title, value }) => (
            <div key={title} className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="text-lg font-bold text-purple-700">{title}</h3>
              <p className="text-3xl text-purple-900 font-extrabold">{value}</p>
            </div>
          ))}
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500">
          &copy; 2025 Stratizen. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
