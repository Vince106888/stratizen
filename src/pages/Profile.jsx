import React, { useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";

import ProfileOverview from "../components/Profile/ProfileOverview";
import ProfileLinks from "../components/Profile/ProfileLinks";
import ProfileTimetable from "../components/Profile/ProfileTimetable";
import ProfileSkills from "../components/Profile/ProfileSkills";
import ProfileMessaging from "../components/Profile/ProfileMessaging";
import ProfilePreferences from "../components/Profile/ProfilePreferences";

import "../styles/Profile.css";

const auth = getAuth(app);
const db = getFirestore(app);

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
  availability: "",
  supportNeeds: "",
  profilePicture: "https://via.placeholder.com/100",
  coverImage: "",
  notificationsEnabled: true,
  themePreference: "auto",
  contactNumber: "",
  discordId: "",
  twitterHandle: "",
  graduationStatus: "enrolled",
  expectedGraduationYear: "",
  campusResidence: "",
  residenceCode: "",
  mentorshipSeeking: false,
  projects: "",
  availabilityHours: "",
  preferredCommunication: "",
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(initialProfilePageForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selectedTab, setSelectedTab] = useState(
    Number(localStorage.getItem("profileActiveTab")) || 0
  );

  const navigate = useNavigate();

  const requiredFields = ["fullName", "username", "school", "year"];
  const missingFields = requiredFields.filter((field) => !form[field]?.trim());

  // Auth + load profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
        return;
      }
      setUser(currentUser);
      setLoading(true);
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm((prev) => ({ ...prev, ...docSnap.data() }));
        }
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

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    if (missingFields.length > 0) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!dirty) {
      setError("No changes to save.");
      return;
    }
    if (!window.confirm("Save changes to your profile?")) return;

    setSaving(true);
    setSaveSuccess(false);
    setError("");
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // auto-hide after 3s
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !dataLoaded) {
    return <div className="profilepage-status profilepage-loading">⏳ Loading profile...</div>;
  }

  return (
    <div className="profilepage-container">
      <h1 className="profilepage-title">
        Welcome to your profile{user?.displayName ? `, ${user.displayName}` : ""}
      </h1>

      {/* Status messages */}
      {loading && (
        <div className="profilepage-status profilepage-loading">⏳ Loading profile...</div>
      )}
      {error && (
        <div className="profilepage-status profilepage-error">❌ {error}</div>
      )}
      {saving && (
        <div className="profilepage-status profilepage-warning">💾 Saving your changes...</div>
      )}
      {saveSuccess && (
        <div className="profilepage-status profilepage-success">✅ Profile updated successfully!</div>
      )}

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
              {requiredFields.includes(tab.toLowerCase()) && missingFields.includes(tab) && (
                <span style={{ color: "red", marginLeft: 4 }}>*</span>
              )}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="profilepage-tab-panels">
          <TabPanel><ProfileOverview form={form} onChange={handleFormChange} /></TabPanel>
          <TabPanel><ProfileLinks form={form} onChange={handleFormChange} /></TabPanel>
          <TabPanel><ProfileTimetable userId={user.uid} /></TabPanel>
          <TabPanel><ProfileSkills form={form} onChange={handleFormChange} /></TabPanel>
          <TabPanel><ProfileMessaging userId={user.uid} /></TabPanel>
          <TabPanel><ProfilePreferences form={form} onChange={handleFormChange} /></TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Centered Save Button */}
      <div className="profilepage-action-container">
        <button
          className="profilepage-save-btn"
          onClick={handleSave}
          disabled={!dataLoaded || saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {!saving && missingFields.length > 0 && (
          <p className="profilepage-status-message error">
            <span style={{ color: "red" }}>*</span> Please fill in all required fields.
          </p>
        )}
      </div>

      <p className="profilepage-disclaimer fancy-disclaimer">
        All information collected is used solely for Stratizen features. Your data is securely stored and will not be shared without your consent.  
        By using this service, you agree to our{" "}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>.
      </p>
    </div>
  );
}
