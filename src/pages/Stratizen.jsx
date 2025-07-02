// src/pages/Stratizen.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "../services/firebase";
import "../styles/Stratizen.css";

const Stratizen = () => {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [error, setError] = useState(null);    // for auth errors or failures

  const auth = getAuth(app);
  const db = getFirestore(app); // still included in case you need it later

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth change detected:", currentUser);
        setUser(currentUser || null); // explicitly set null if no user
      });

      return () => {
        console.log("Cleaning up auth listener");
        unsubscribe();
      };
    } catch (err) {
      console.error("Auth listener error:", err);
      setError("Failed to load authentication status.");
      setUser(null); // safely degrade
    }
  }, [auth]);

  if (error) {
    return <div className="error-message">🚨 {error}</div>;
  }

  if (user === undefined) {
    return <p>Loading Stratizen Hub...</p>;
  }

  return (
    <div className="stratizen-container">
      <h1 className="stratizen-title">🌐 Stratizen Hub</h1>
      <p className="stratizen-subtitle">
        Welcome to your social + learning universe — clubs, updates, XP, and teams all start here.
      </p>

      <div className="stratizen-grid">
        <div className="stratizen-card">
          <h2>📢 Community Feed</h2>
          <p>Feed of posts, challenges, and updates goes here.</p>
        </div>

        <div className="stratizen-card">
          <h2>🎯 Clubs & Teams</h2>
          <p>Explore student clubs, study teams, and societies.</p>
        </div>

        <div className="stratizen-card">
          <h2>🏆 Leaderboard & Badges</h2>
          <p>Track top contributors and achievements.</p>
        </div>

        <div className="stratizen-card">
          <h2>🔊 Voice Rooms</h2>
          <p>Hang out or collaborate in real time.</p>
        </div>
      </div>
    </div>
  );
};

export default Stratizen;
