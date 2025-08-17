import React, { useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";

import ProfileOverview from "../components/Profile/ProfileOverview";
import ProfileLinks from "../components/Profile/ProfileLinks";
import ProfileTimetable from "../components/Profile/ProfileTimetable";
import ProfileSkills from "../components/Profile/ProfileSkills";
import ProfileMessaging from "../components/Profile/ProfileMessaging";
import ProfilePreferences from "../components/Profile/ProfilePreferences";

import {
  getUserProfile,
  createUserProfile,
} from "../services/db";

import "../styles/Profile.css";

// Tabs displayed in the profile page
const profilePageTabs = [
  "Overview",
  "Links",
  "Timetable",
  "Skills",
  "Messaging",
  "Preferences",
];

// Default form structure for a new user profile
const initialProfilePageForm = {
  fullName: "",
  username: "",
  bio: "",
  purpose: "",
  school: "",
  year: "",
  group: "",
  skills: [],
  linkedin: "",
  github: "",
  website: "",
  interests: [],
  supportNeeds: "",
  profilePicture: "https://via.placeholder.com/100",
  notificationsEnabled: true,
  themePreference: "auto",
  contactNumber: "",
  discordId: "",
  twitterHandle: "",
  Status: "enrolled",
  expectedGraduationYear: "",
  residence: "",
  mentorshipSeeking: false,
  xp: 0,
};

export default function ProfilePage() {
  // Firebase authenticated user object
  const [user, setUser] = useState(null);
  // Profile form state
  const [form, setForm] = useState(initialProfilePageForm);
  // Track loading state
  const [loading, setLoading] = useState(true);
  // Track error messages
  const [error, setError] = useState("");
  // Track whether profile data has been successfully loaded at least once
  const [dataLoaded, setDataLoaded] = useState(false);
  // Remember which tab is currently active (persisted in localStorage)
  const [selectedTab, setSelectedTab] = useState(
    Number(localStorage.getItem("profileActiveTab")) || 0
  );

  const navigate = useNavigate();

  // ---------------- AUTH + PROFILE LOADING ----------------
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (!currentUser) {
        // If user not logged in, redirect to auth page
        navigate("/auth", { replace: true });
        return;
      }

      setUser(currentUser);
      setLoading(true);
      setError("");

      try {
        // Try to fetch user profile from DB
        let profile = await getUserProfile(currentUser.uid);

        // If profile does not exist, create a new one with default values
        if (!profile) {
          profile = await createUserProfile(currentUser, {
            ...initialProfilePageForm,
            xp: 50, // give new users some XP as a starter
          });
        }

        // Merge profile data into form
        setForm((prev) => ({ ...initialProfilePageForm, ...profile }));
      } catch (err) {
        console.error("Profile load error:", err);
        setError("Unable to load profile data.");
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    });

    // Cleanup: unsubscribe from auth listener when component unmounts
    return () => unsubscribe();
  }, [navigate]);

  // Update form state when a field changes
  const handleFormChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ---------------- LOADING STATE ----------------
  if (loading && !dataLoaded) {
    return (
      <div className="profilepage-status profilepage-loading">
        ⏳ Loading profile...
      </div>
    );
  }

  // ---------------- MAIN RENDER ----------------
  return (
    <div className="profilepage-container">
      {/* Greeting Title */}
      <h1 className="profilepage-title">
        Welcome to your profile{user?.displayName ? `, ${user.displayName}` : ""} 👋
      </h1>

      {/* Tab Navigation (Headless UI Tabs) */}
      <TabGroup
        selectedIndex={selectedTab}
        onChange={(index) => {
          setSelectedTab(index);
          localStorage.setItem("profileActiveTab", index); // persist selected tab
        }}
      >
        {/* Tab Buttons */}
        <TabList className="profilepage-tab-list">
          {profilePageTabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `profilepage-tab ${selected ? "profilepage-tab-selected" : ""}`
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        {/* Tab Content Panels */}
        <TabPanels className="profilepage-tab-panels">
          <TabPanel>
            <ProfileOverview
              form={form}
              onChange={handleFormChange}
            />
          </TabPanel>
          <TabPanel>
            <ProfileLinks
              form={form}
              onChange={handleFormChange}
              userId={user?.uid}
            />
          </TabPanel>
          <TabPanel>
            {user && <ProfileTimetable userId={user.uid} />}
          </TabPanel>
          <TabPanel>
            <ProfileSkills form={form} onChange={handleFormChange} />
          </TabPanel>
          <TabPanel>
            {user && <ProfileMessaging userId={user.uid} />}
          </TabPanel>
          <TabPanel>
            <ProfilePreferences form={form} onChange={handleFormChange} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Disclaimer Section */}
      <p className="profilepage-disclaimer fancy-disclaimer">
        All information collected is used solely for Stratizen features. Your
        data is securely stored and will not be shared without your consent. By
        using this service, you agree to our{" "}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
