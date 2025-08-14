// src/components/Dashboard/UserProfile.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../../services/db";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard/UserProfile.css";

export default function UserProfile({ stats = {} }) {
  const auth = getAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    year: "",
    school: "",
    group: "",
    bio: "",
    interests: "",
    residence: "",
    profileImageUrl: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfile = useCallback(async (uid) => {
    try {
      setLoading(true);
      const data = await getUserProfile(uid);
      if (data) {
        setProfileData((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, v || ""])
          ),
        }));
      }
    } catch (error) {
      console.error("[Dashboard:UserProfile] Error fetching profile:", error);
      setErrorMessage("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchProfile(currentUser.uid);
      }
    });
    return unsubscribe;
  }, [auth, fetchProfile, navigate]);

  const xpPercent = useMemo(() => {
    const xpValue = Number(stats.xp) || 0;
    return Math.min((xpValue / 1000) * 100, 100);
  }, [stats.xp]);

  const level = useMemo(() => {
    const xpValue = Number(stats.xp) || 0;
    return Math.max(Math.floor(xpValue / 100), 1);
  }, [stats.xp]);

  return (
    <section className="user-profile">
      <div className="profile-top">
        {/* Profile Image Display Only */}
        <div className="profile-pic-wrapper">
          {profileData.profileImageUrl ? (
            <>
              <div className="halo-glow" />
              <img
                src={profileData.profileImageUrl}
                alt="Profile"
                className="profile-pic"
              />
            </>
          ) : (
            <div className="profile-pic placeholder" />
          )}
        </div>

        <div className="profile-text">
          <h1>
            Welcome back,{" "}
            <span className="username">
              {loading ? "Loading..." : profileData.username || "User"}
            </span>
            !
          </h1>
          <p className="bio">
            {loading
              ? "Fetching your bio..."
              : profileData.bio || "No bio provided."}
          </p>
          <p className="purpose">
            {profileData.school
              ? `${profileData.school}, Year ${profileData.year || "?"}`
              : ""}
          </p>
        </div>
      </div>

      {/* XP Progress */}
      <div
        className="xp-bar"
        role="progressbar"
        aria-valuenow={xpPercent.toFixed(0)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`XP progress: ${xpPercent.toFixed(0)}%`}
      >
        <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
      </div>

      {/* Level & Rank */}
      <div className="level-rank">
        <div className="level">Level {level}</div>
        <div className="rank" title={`Rank #${stats.rank ?? "N/A"}`}>
          🏅 #{stats.rank ?? "N/A"}
        </div>
      </div>

      {errorMessage && (
        <p className="error-text" role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
