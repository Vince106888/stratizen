import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getUserProfile } from "../services/db";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, LogOut } from "lucide-react";
import strathLogo from "../assets/SU-Logo.png";
import { useTheme } from '../context/ThemeContext';
import "../styles/MainLayout.css";

const MainLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState("https://via.placeholder.com/40");
  const [userName, setUserName] = useState("User");

  // Fetch logged-in user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserPhoto(
            profile?.profilePicture ||
              currentUser.photoURL ||
              "https://via.placeholder.com/40"
          );
          setUserName(profile?.fullName || currentUser.displayName || "User");
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      localStorage.removeItem("user");
      sessionStorage.clear();
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      {/* ---------------- Top Navigation ---------------- */}
      <header className="top-nav">
        {/* Left: Sidebar toggle */}
        <div className="nav-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        {/* Center Branding */}
        <div
          className="nav-center"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img
            src={strathLogo}
            alt="Strathmore University"
            className="logo-center"
          />
          <h1 className="brand-name">Stratizen</h1>
        </div>

        {/* Right Controls */}
        <div className="nav-right">
          {/* Theme Toggle */}
          <button
            onClick={() => toggleTheme()}
            className="nav-icon-btn ml-2 p-1 rounded bg-strathmore-light dark:bg-strathmore-dark text-strathmore-blue dark:text-strathmore-light"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {/* Notifications */}
          <button className="nav-icon-btn">
            <Bell size={22} />
          </button>
          {/* Settings Dropdown */}
          <div
            className="settings-container"
            onMouseEnter={() => setSettingsDropdownOpen(true)}
            onMouseLeave={() => setSettingsDropdownOpen(false)}
          >
            <button className="nav-icon-btn">
              <Settings size={22} />
            </button>
            <AnimatePresence>
              {settingsDropdownOpen && (
                <motion.div
                  className="settings-dropdown"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="dropdown-name">⚙️ Settings</p>
                  <hr />
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setSettingsDropdownOpen(false);
                    }}
                  >
                    Open Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div
            className="profile-container"
            onMouseEnter={() => setProfileDropdownOpen(true)}
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            <img src={userPhoto} alt={userName} className="profile-img" />
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="profile-info">
                    <img
                      src={userPhoto}
                      alt={userName}
                      className="dropdown-avatar"
                    />
                    <span className="dropdown-name">{userName}</span>
                  </div>
                  <hr />
                  <button onClick={() => navigate("/profile")}>
                    View Profile
                  </button>
                  <hr />
                  <button onClick={handleLogout} className="logout">
                    <LogOut size={18} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ---------------- Main Layout ---------------- */}
      <div className="main-layout">
        {sidebarOpen && <Sidebar handleLogout={handleLogout} />}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
