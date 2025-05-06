import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, getDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({
    messages: 0,
    forum: 0,
    marketplace: 0,
  });
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
        const userData = userSnap.exists() ? userSnap.data() : {};

        const messagesRef = collection(db, 'messages', user.uid, 'conversations');
        const forumRef = collection(db, 'forum', user.uid, 'posts');
        const marketplaceRef = collection(db, 'marketplace', user.uid, 'items');

        const [messagesSnap, forumSnap, marketplaceSnap] = await Promise.all([
          getDocs(messagesRef),
          getDocs(forumRef),
          getDocs(marketplaceRef),
        ]);

        setUserData({
          username: userData.username || 'User',
          bio: userData.bio || '',
          purpose: userData.purpose || '',
          profilePic: userData.profilePic || 'https://via.placeholder.com/80',
        });

        setStats({
          messages: messagesSnap.size,
          forum: forumSnap.size,
          marketplace: marketplaceSnap.size,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Stratizen Dashboard</h1>
        <nav>
          <ul className="nav-links">
            <li><a href="/profile">Profile</a></li>
            <li><a href="/forum">Forum</a></li>
            <li><a href="/messages">Messages</a></li>
            <li><a href="/marketplace">Marketplace</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </nav>
      </header>

      <main className="dashboard-main">
        <div className="profile-section">
          <img src={userData.profilePic} alt="Profile" />
          <div>
            <h2>{userData.username}</h2>
            <p>{userData.bio}</p>
            <p className="purpose">{userData.purpose}</p>
          </div>
        </div>

        <section className="stats-section">
          <div className="stat-card">
            <h3>Messages</h3>
            <p>{stats.messages}</p>
          </div>
          <div className="stat-card">
            <h3>Forum Posts</h3>
            <p>{stats.forum}</p>
          </div>
          <div className="stat-card">
            <h3>Marketplace Items</h3>
            <p>{stats.marketplace}</p>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2025 Stratizen. All rights reserved.</p>
      </footer>
    </div>
  );
}
