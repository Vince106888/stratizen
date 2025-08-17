import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, User, Shield, Bell } from "lucide-react";

import AppearanceSettings from "../components/Settings/AppearanceSettings";
import AccountSettings from "../components/Settings/AccountSettings";
import PrivacySettings from "../components/Settings/PrivacySettings";
import NotificationSettings from "../components/Settings/NotificationSettings";

import "../styles/SettingsPage.css";

// Config: all settings sections with icons
const settingsSections = [
  { 
    id: "appearance", 
    label: "Appearance", 
    icon: <Palette size={18} />, 
    component: AppearanceSettings, 
    description: "Customize how your dashboard looks and feels." 
  },
  { 
    id: "account", 
    label: "Account & Profile", 
    icon: <User size={18} />, 
    component: AccountSettings, 
    description: "Update your personal details and manage account preferences." 
  },
  { 
    id: "privacy", 
    label: "Privacy & Security", 
    icon: <Shield size={18} />, 
    component: PrivacySettings, 
    description: "Control who sees your activity and secure your account." 
  },
  { 
    id: "notifications", 
    label: "Notifications", 
    icon: <Bell size={18} />, 
    component: NotificationSettings, 
    description: "Choose how and when you receive updates." 
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("appearance");
  const activeMeta = settingsSections.find((s) => s.id === activeSection);

  const renderSection = () => {
    if (activeMeta?.component) {
      const SectionComponent = activeMeta.component;
      return <SectionComponent />;
    }
    return <AppearanceSettings />; // fallback
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-page">
        {/* Sidebar */}
        <nav className="settings-sidebar" role="tablist" aria-label="Settings Sections">
          <h2 className="sidebar-title">⚙️ Settings</h2>
          <p className="sidebar-subtitle">Personalize your experience</p>
          <ul>
            {settingsSections.map((section) => (
              <li key={section.id} className="settings-tab-container">
                <button
                  role="tab"
                  aria-selected={activeSection === section.id}
                  className={`settings-tab ${activeSection === section.id ? "active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                  title={section.label}
                >
                  <span className="tab-icon">{section.icon}</span>
                  <span>{section.label}</span>
                </button>

                {/* Highlight bar animation */}
                {activeSection === section.id && (
                  <motion.div
                    layoutId="active-highlight"
                    className="tab-highlight"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="settings-content">
          <header className="settings-header">
            <h1 className="settings-title">{activeMeta?.label}</h1>
            <p className="settings-description">{activeMeta?.description}</p>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="settings-panel"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
