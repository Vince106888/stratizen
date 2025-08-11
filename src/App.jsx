import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import './styles/App.css';

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Stratizen = lazy(() => import('./pages/Stratizen'));
const Forum = lazy(() => import('./pages/Forum'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const Messages = lazy(() => import('./pages/Messages'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Auth = lazy(() => import('./pages/Auth'));
const Mentorship = lazy(() => import('./pages/Mentorship'));
const StudyHub = lazy(() => import('./pages/StudyHub'));
const QuestionPage = lazy(() => import('./pages/QuestionPage'));
const ResourceLibrary = lazy(() => import('./pages/ResourceLibrary'));
const InnovationHub = lazy(() => import('./pages/InnovationHub'));
const CareersPage = lazy(() => import('./pages/CareersPage'));

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stratizen" element={<Stratizen />} />
        <Route path="/studyhub" element={<StudyHub />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:topicId" element={<TopicPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/questions/:id" element={<QuestionPage />} />
        <Route path="/resource-library" element={<ResourceLibrary />} />
        <Route path="/innovation" element={<InnovationHub />} />
        <Route path="/careers" element={<CareersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Auth />} />
    </Routes>
  );
}

export default App;
