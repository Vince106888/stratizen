import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Messages from './pages/Messages';
import Marketplace from './pages/Marketplace';
import Auth from './pages/Auth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="*" element={<Auth />} />
    </Routes>
  );
}

export default App;
