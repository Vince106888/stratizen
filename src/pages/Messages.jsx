import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import '../styles/Chat.css';

const Messages = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [contact, setContact] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  // On mount, check auth
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/auth');
    } else {
      // you can choose to use user.uid or user.displayName
      setCurrentUser(user.uid);
    }
  }, [auth, navigate]);

  // If not logged in yet, don't render anything
  if (!currentUser) return null;

  // If a contact is selected, show the Chat component
  if (selectedUser) {
    return (
      <div className="messages-page">
        <h2>Secure Chat</h2>
        <Chat currentUser={currentUser} selectedUser={selectedUser} />
      </div>
    );
  }

  // Otherwise show a simple "select contact" form
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 mt-10 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Messages</h2>
      <p className="mb-4">
        Enter the UID (or username) of the person you want to chat with:
      </p>
      <input
        type="text"
        placeholder="Contact UID or name"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="w-full p-4 border rounded-lg mb-4"
      />
      <button
        onClick={() => contact.trim() && setSelectedUser(contact.trim())}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
      >
        Start Chat
      </button>
    </div>
  );
};

export default Messages;
