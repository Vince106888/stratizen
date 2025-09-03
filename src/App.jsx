// src/App.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ Global theme context
import "./styles/App.css";

// -------------------- Lazy-loaded pages --------------------
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Stratizen = lazy(() => import("./pages/Stratizen"));
const Noticeboard = lazy(() => import("./pages/Noticeboard"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const Messages = lazy(() => import("./pages/Messages"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Auth = lazy(() => import("./pages/Auth"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const StudyHub = lazy(() => import("./pages/StudyHub"));
const QuestionPage = lazy(() => import("./pages/QuestionPage"));
const ResourceLibrary = lazy(() => import("./pages/ResourceLibrary"));
const InnovationHub = lazy(() => import("./pages/InnovationHub"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function App() {
  return (
    <ThemeProvider>
      {/* ✅ Suspense fallback to avoid blank screen on lazy load */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
            Loading...
          </div>
        }
      >
        <Routes>
          {/* ---------------- Public Routes ---------------- */}
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />

          {/* ---------------- Protected Routes ---------------- */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stratizen" element={<Stratizen />} />
            <Route path="/studyhub" element={<StudyHub />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/noticeboard" element={<Noticeboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/questions/:id" element={<QuestionPage />} />
            <Route path="/resource-library" element={<ResourceLibrary />} />
            <Route path="/innovation" element={<InnovationHub />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* ---------------- Fallback Route ---------------- */}
          <Route path="*" element={<Auth />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
