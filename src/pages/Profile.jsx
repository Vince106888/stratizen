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

const profilePageTabs = [
  "Overview",
  "Links",
  "Timetable",
  "Skills",
  "Messaging",
  "Preferences",
];

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
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(initialProfilePageForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(
    Number(localStorage.getItem("profileActiveTab")) || 0
  );

  const navigate = useNavigate();

  // Auth + load/create profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (!currentUser) {
        navigate("/auth", { replace: true });
        return;
      }
      setUser(currentUser);
      setLoading(true);
      setError("");
      try {
        let profile = await getUserProfile(currentUser.uid);
        if (!profile) {
          profile = await createUserProfile(currentUser, {
            ...initialProfilePageForm,
            xp: 50,
          });
        }
        setForm((prev) => ({ ...initialProfilePageForm, ...profile }));
      } catch (err) {
        console.error("Profile load error:", err);
        setError("Unable to load profile data.");
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFormChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (loading && !dataLoaded) {
    return (
      <div className="profilepage-status profilepage-loading">
        ⏳ Loading profile...
      </div>
    );
  }

  return (
    <div className="profilepage-container">
      <h1 className="profilepage-title">
        Welcome to your profile{user?.displayName ? `, ${user.displayName}` : ""} 👋
      </h1>

      <TabGroup
        selectedIndex={selectedTab}
        onChange={(index) => {
          setSelectedTab(index);
          localStorage.setItem("profileActiveTab", index);
        }}
      >
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
          <TabPanel>{user && <ProfileTimetable userId={user.uid} />}</TabPanel>
          <TabPanel>
            <ProfileSkills form={form} onChange={handleFormChange} />
          </TabPanel>
          <TabPanel>{user && <ProfileMessaging userId={user.uid} />}</TabPanel>
          <TabPanel>
            <ProfilePreferences form={form} onChange={handleFormChange} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

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
