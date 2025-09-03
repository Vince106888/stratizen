// src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getUserProfile } from "../services/db";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, LogOut, Sun, Moon, Menu } from "lucide-react";
import strathLogo from "../assets/SU-Logo.png";
import { useTheme } from "../context/ThemeContext";
import "../styles/MainLayout.css";

const MainLayout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Sidebar states
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Dropdown states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  // User states
  const [userPhoto, setUserPhoto] = useState("https://via.placeholder.com/40");
  const [userName, setUserName] = useState("User");

  const mainRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserPhoto(
            profile?.profilePicture || currentUser.photoURL || "https://via.placeholder.com/40"
          );
          setUserName(profile?.fullName || currentUser.displayName || "User");
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    handleResize(); // initialize
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Click outside sidebar to close (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        mobileSidebarOpen &&
        mainRef.current &&
        !mainRef.current.contains(event.target)
      ) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, mobileSidebarOpen]);

  // Logout handler
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

  // Sidebar toggle
  const toggleSidebar = () => {
    isMobile
      ? setMobileSidebarOpen((prev) => !prev)
      : setDesktopSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-shell bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen transition-colors duration-300">
      {/* ---------------- Top Navigation ---------------- */}
      <header className="top-nav bg-[var(--color-navbar)] text-[var(--color-navbar-text)] shadow-md rounded-b-2xl px-4 py-2 flex items-center justify-between z-50 relative">
        {/* Sidebar toggle */}
        <div className="nav-left">
          <button
            className="menu-toggle p-2 rounded-xl bg-[var(--color-sidebar-bg)] text-[var(--color-text)] shadow hover:scale-105 transition"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Center Branding */}
        <div
          className="nav-center flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img src={strathLogo} alt="Strathmore University" className="logo-center h-10 w-auto" />
          <h1 className="brand-name font-bold text-lg">Stratizen</h1>
        </div>

        {/* Right Controls */}
        <div className="nav-right flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="nav-icon-btn p-2 rounded-full bg-[var(--color-sidebar-bg)] text-[var(--color-text)] shadow-md hover:scale-105 transition"
            whileTap={{ scale: 0.9, rotate: 90 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "light" ? (
                <motion.div
                  key="moon"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <button className="nav-icon-btn p-2 rounded-full bg-[var(--color-sidebar-bg)] text-[var(--color-text)] shadow hover:scale-105 transition">
            <Bell size={22} />
          </button>

          {/* Settings Dropdown */}
          <div
            className="settings-container relative"
            onMouseEnter={() => setSettingsDropdownOpen(true)}
            onMouseLeave={() => setSettingsDropdownOpen(false)}
          >
            <button className="nav-icon-btn p-2 rounded-full bg-[var(--color-sidebar-bg)] text-[var(--color-text)] shadow hover:scale-105 transition">
              <Settings size={22} />
            </button>
            <AnimatePresence>
              {settingsDropdownOpen && (
                <motion.div
                  className="settings-dropdown absolute right-0 mt-2 w-48 bg-[var(--color-dropdown-bg)] backdrop-blur-md shadow-lg rounded-2xl p-3 z-50"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="dropdown-name font-semibold mb-2">⚙️ Settings</p>
                  <hr className="border-gray-300 dark:border-gray-700 my-2" />
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setSettingsDropdownOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-[var(--color-gold)] hover:text-black transition"
                  >
                    Open Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div
            className="profile-container relative"
            onMouseEnter={() => setProfileDropdownOpen(true)}
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            <img
              src={userPhoto}
              alt={userName}
              className="profile-img h-10 w-10 rounded-full shadow cursor-pointer"
            />
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  className="profile-dropdown absolute right-0 mt-2 w-56 bg-[var(--color-dropdown-bg)] backdrop-blur-md shadow-lg rounded-2xl p-4 z-50"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="profile-info flex items-center gap-3 mb-3">
                    <img
                      src={userPhoto}
                      alt={userName}
                      className="dropdown-avatar h-12 w-12 rounded-full shadow"
                    />
                    <span className="dropdown-name font-medium">{userName}</span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-700 my-2" />
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-[var(--color-gold)] hover:text-black transition"
                  >
                    View Profile
                  </button>
                  <hr className="border-gray-300 dark:border-gray-700 my-2" />
                  <button
                    onClick={handleLogout}
                    className="logout w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ---------------- Main Layout ---------------- */}
      <div className="main-layout flex relative" ref={mainRef}>
        {/* Mobile backdrop */}
        <AnimatePresence>
          {isMobile && mobileSidebarOpen && (
            <motion.div
              className="sidebar-backdrop fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <Sidebar
          handleLogout={handleLogout}
          isOpen={isMobile ? mobileSidebarOpen : desktopSidebarOpen}
          collapsed={!isMobile && !desktopSidebarOpen} // new collapsed state for desktop
          setIsOpen={isMobile ? setMobileSidebarOpen : setDesktopSidebarOpen}
        />

        {/* Main Content */}
        <main className="main-content flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
