import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Messages from './pages/Messages'; // Messages page now wraps Chat component
import Marketplace from './pages/Marketplace';
import Auth from './pages/Auth';
import './styles/App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/logo.png" className="logo react" alt="React logo" />
        <h1>Welcome to Stratizen P2P Student Platform</h1>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/messages" element={<Messages />} /> {/* Secure Messaging */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p className="read-the-docs">Empowering students with tech & community.</p>
      </footer>
    </div>
  );
}

export default App;
