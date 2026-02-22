// src/components/Dashboard/UserProfile.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../../services/db";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard/UserProfile.css";

export default function UserProfile({ stats = {} }) {
  const auth = getAuth();
  const navigate = useNavigate();
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

  // -----------------------------
  // Fetch profile data from Firestore
  // -----------------------------
  const fetchProfile = useCallback(async (uid) => {
    try {
      setLoading(true);
      const data = await getUserProfile(uid);
      if (data) {
        setProfileData((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, v || ""]),
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

  // -----------------------------
  // Listen for auth changes
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        fetchProfile(currentUser.uid);
      }
    });
    return unsubscribe;
  }, [auth, fetchProfile, navigate]);

  // -----------------------------
  // Compute XP percentage
  // -----------------------------
  const xpPercent = useMemo(() => {
    const xpValue = Number(stats.xp) || 0;
    return Math.min((xpValue / 1000) * 100, 100);
  }, [stats.xp]);

  // -----------------------------
  // Compute Level
  // -----------------------------
  const level = useMemo(() => {
    const xpValue = Number(stats.xp) || 0;
    return Math.max(Math.floor(xpValue / 100), 1);
  }, [stats.xp]);

  // -----------------------------
  // Main Render
  // -----------------------------
  return (
    <section
      className={`user-profile p-4 rounded-lg transition-colors duration-300
                  bg-white dark:bg-strathmore-blue
                  text-strathmore-blue dark:text-strathmore-light`}
    >
      {/* ----------------- Profile Top ----------------- */}
      <div className="profile-top flex flex-col md:flex-row items-center gap-4">
        {/* Profile Image */}
        <div className="profile-pic-wrapper relative">
          {profileData.profileImageUrl ? (
            <>
              <div className="halo-glow absolute -inset-1 rounded-full" />
              <img
                src={profileData.profileImageUrl}
                alt="Profile"
                className="profile-pic w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-2 border-strathmore-blue dark:border-strathmore-light"
              />
            </>
          ) : (
            <div className="profile-pic placeholder w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-300 dark:bg-gray-700" />
          )}
        </div>

        {/* Profile Text */}
        <div className="profile-text flex-1">
          <h1 className="text-xl md:text-2xl font-semibold mb-1">
            Welcome back,{" "}
            <span className="username font-bold">
              {loading ? "Loading..." : profileData.username || "User"}
            </span>
            !
          </h1>
          <p className="bio text-sm md:text-base mb-1">
            {loading
              ? "Fetching your bio..."
              : profileData.bio || "No bio provided."}
          </p>
          <p className="purpose text-sm text-gray-600 dark:text-gray-300">
            {profileData.school
              ? `${profileData.school}, Year ${profileData.year || "?"}`
              : ""}
          </p>
        </div>
      </div>

      {/* ----------------- XP Progress Bar ----------------- */}
      <div
        className="xp-bar h-3 w-full rounded-full mt-4 bg-gray-200 dark:bg-gray-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={xpPercent.toFixed(0)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`XP progress: ${xpPercent.toFixed(0)}%`}
      >
        <div
          className="xp-fill h-full bg-strathmore-blue dark:bg-strathmore-light transition-all duration-500"
          style={{ width: `${xpPercent}%` }}
        />
      </div>

      {/* ----------------- Level & Rank ----------------- */}
      <div className="level-rank flex justify-between items-center mt-3 text-sm md:text-base font-medium">
        <div className="level">Level {level}</div>
        <div className="rank" title={`Rank #${stats.rank ?? "N/A"}`}>
          Rank #{stats.rank ?? "N/A"}
        </div>
      </div>

      {/* ----------------- Error Message ----------------- */}
      {errorMessage && (
        <p
          className="error-text text-red-600 dark:text-red-300 mt-2"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </section>
  );
}
