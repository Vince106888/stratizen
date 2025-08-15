// src/pages/Messages.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../services/firebase";
import Chat from "../components/Chat";
import "../styles/Messages.css";

const dummyUsers = [
  { id: "user1", name: "Alice Johnson", role: "Student" },
  { id: "user2", name: "Bob Smith", role: "Lecturer" },
  { id: "user3", name: "Charlie Brown", role: "Peer Mentor" },
  { id: "user4", name: "Diana Prince", role: "Alumni" },
  { id: "user5", name: "Ethan Clark", role: "Student" },
];

const Messages = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/auth");
      } else {
        setCurrentUser(user.uid);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, navigate]);

  if (loading) return <div className="messages-loading">Loading…</div>;
  if (!currentUser) return null;

  const contacts = dummyUsers.filter((u) => u.id !== currentUser);

  return (
    <div className="messages-wrapper">
      {/* LEFT PANEL: Contacts */}
      <aside className="messages-sidebar">
        <div className="messages-sidebar__header">Contacts</div>
        <div className="messages-sidebar__list">
          {contacts.map((u) => (
            <div
              key={u.id}
              className={`messages-sidebar__item ${
                selectedUser?.id === u.id ? "is-active" : ""
              }`}
              onClick={() => setSelectedUser(u)}
            >
              <div className="messages-avatar">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="messages-user-info">
                <div className="messages-name">{u.name}</div>
                <div className="messages-role">{u.role}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MIDDLE PANEL: Chat */}
      <main className="messages-chat">
        {selectedUser ? (
          <Chat
            currentUser={currentUser}
            selectedUser={selectedUser.id}
            selectedUserName={selectedUser.name}
          />
        ) : (
          <div className="messages-empty">
            <span>💬</span> Select a contact to start chatting.
          </div>
        )}
      </main>

      {/* RIGHT PANEL: Contact Info */}
      <aside className="messages-details">
        {selectedUser ? (
          <div className="details-content">
            {/* Contact Info */}
            <div className="details-header">
              <div className="details-avatar">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="details-name">{selectedUser.name}</h3>
                <p className="details-role">{selectedUser.role}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="details-actions">
              <button className="details-action primary">View Profile</button>
              <button className="details-action secondary">
                Start Video Call
              </button>
            </div>

            {/* Recent Activity */}
            <h4 className="details-subtitle">Recent Activity</h4>
            <ul className="details-activity">
              <li>📄 Sent an assignment</li>
              <li>📚 Joined Math Study Group</li>
              <li>⏳ Last active: 2h ago</li>
            </ul>
          </div>
        ) : (
          <div className="details-placeholder">
            ℹ️ Select a contact to see details.
          </div>
        )}
      </aside>
    </div>
  );
};

export default Messages;
