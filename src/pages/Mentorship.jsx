// src/pages/Mentorship.jsx
import React, { useMemo, useState } from "react";
import "../styles/Mentorship.css";

import MentorshipForm from "../components/Mentorship/MentorshipForm";
import MentorshipList from "../components/Mentorship/MentorshipList";

// Dummy user for MVP
const mockUser = { uid: "123", displayName: "Demo User" };

// Dummy seed data
const dummySubmissions = [
  { id: "1", userId: "u1", name: "Alice Mentor", role: "mentor" },
  { id: "2", userId: "u2", name: "Bob Mentee", role: "mentee" },
  { id: "3", userId: "u3", name: "Carol Mentor", role: "mentor" },
  { id: "4", userId: "u4", name: "David Mentee", role: "mentee" },
];

export default function MentorshipPage() {
  const [role, setRole] = useState("mentor");
  const [submissions, setSubmissions] = useState(dummySubmissions);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const user = mockUser;
  const oppositeRole = role === "mentor" ? "mentee" : "mentor";

  /** ===== FILTERS ===== **/
  const relevantSubmissions = useMemo(() => {
    const filtered = submissions.filter((e) => e.role === oppositeRole);
    if (!searchTerm.trim()) return filtered;
    return filtered.filter((e) =>
      (e.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, oppositeRole, searchTerm]);

  const mentors = useMemo(
    () => submissions.filter((e) => e.role === "mentor"),
    [submissions]
  );

  const mentees = useMemo(
    () => submissions.filter((e) => e.role === "mentee"),
    [submissions]
  );

  /** ===== HANDLERS ===== **/
  const handleSubmit = (payload, editingId) => {
    if (editingId) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
      );
      alert("Mentorship info updated (local only).");
    } else {
      setSubmissions((prev) => [
        ...prev,
        { id: Date.now().toString(), ...payload, userId: user.uid },
      ]);
      alert("Mentorship info submitted (local only).");
    }
    setEditingEntry(null);
  };

  const handleEdit = (entry) => setEditingEntry(entry);

  const handleDelete = (id) => {
    if (!window.confirm("Delete this submission?")) return;
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRequestConnection = (targetUserId) => {
    alert(`Pretend to send connection request to ${targetUserId}...`);
  };

  /** ===== RENDER ===== **/
  return (
    <div className="mentorship-container">
      {/* Left Section */}
      <section className="mentorship-main">
        <header className="mentorship-header">
          <h1 className="title">Mentorship Hub (MVP)</h1>
        </header>

        {/* Search Bar */}
        <div className="mentorship-search">
          <input
            type="text"
            placeholder="Search mentors/mentees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-clear" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        <MentorshipForm
          user={user}
          role={role}
          setRole={setRole}
          editingEntry={editingEntry}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingEntry(null)}
        />

        <MentorshipList
          title={role === "mentor" ? "🎓 Available Mentees" : "🧑‍🏫 Available Mentors"}
          submissions={relevantSubmissions}
          currentUser={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRequestConnection={handleRequestConnection}
          getStatusFor={() => null} // dummy
        />
      </section>

      {/* Right Panel */}
      <aside className="mentorship-side">
        <div className="panel-box">
          <h3>🧑‍🏫 Mentors</h3>
          {mentors.length === 0 ? (
            <p className="empty-text">No mentors yet.</p>
          ) : (
            mentors.map((m) => (
              <div key={m.id} className="panel-item">
                <span className="name">{m.name || "Unnamed"}</span>
                <span className="status status-none">Not Seen</span>
              </div>
            ))
          )}
        </div>

        <div className="panel-box">
          <h3>🎓 Mentees</h3>
          {mentees.length === 0 ? (
            <p className="empty-text">No mentees yet.</p>
          ) : (
            mentees.map((m) => (
              <div key={m.id} className="panel-item">
                <span className="name">{m.name || "Unnamed"}</span>
                <span className="status status-none">Not Seen</span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
