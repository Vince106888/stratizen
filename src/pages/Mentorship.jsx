// src/pages/Mentorship.jsx
import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../services/firebase";
import "../styles/Mentorship.css";

import MentorshipForm from "../components/Mentorship/MentorshipForm";
import MentorshipList from "../components/Mentorship/MentorshipList";

import {
  listenMentorshipSubmissions,
  listenUserConnections,
  createMentorshipSubmission,
  updateMentorshipSubmission,
  deleteMentorshipSubmission,
  requestConnection,
  connectionExists,
  getConnectionStatus,
  searchMentorshipSubmissions,
} from "../services/mentorshipService";

export default function MentorshipPage() {
  const [role, setRole] = useState("mentor");
  const [submissions, setSubmissions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = auth.currentUser;

  /** ===== UTILS ===== **/
  const getStatusFor = (targetUserId) =>
    getConnectionStatus(connections, user?.uid, targetUserId);

  const sortBySeenFirst = (a, b) => {
    const statusA = getStatusFor(a.userId);
    const statusB = getStatusFor(b.userId);
    // Accepted/seen first, then pending, then null
    const priority = { accepted: 0, pending: 1, rejected: 2, null: 3, undefined: 3 };
    return (priority[statusA] ?? 3) - (priority[statusB] ?? 3);
  };

  /** ===== STREAM: All mentorship submissions ===== **/
  useEffect(() => {
    if (searchTerm.trim()) return; // skip live updates if searching
    setLoading(true);
    const unsub = listenMentorshipSubmissions(
      db,
      (data) => {
        setSubmissions(data);
        setLoading(false);
      },
      () => {
        setError("Failed to load mentorship submissions.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [searchTerm]);

  /** ===== STREAM: Current user's connections ===== **/
  useEffect(() => {
    if (!user) return;
    const unsub = listenUserConnections(
      db,
      user.uid,
      (data) => setConnections(data),
      () => {}
    );
    return () => unsub();
  }, [user]);

  /** ===== SEARCH: Debounced query ===== **/
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) return;
    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        const results = await searchMentorshipSubmissions(db, term);
        setSubmissions(results);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Search failed.");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const oppositeRole = role === "mentor" ? "mentee" : "mentor";

  /** ===== FILTER: Main list ===== **/
  const relevantSubmissions = useMemo(
    () => submissions.filter((e) => e.role === oppositeRole),
    [submissions, oppositeRole]
  );

  /** ===== FILTER: Side panels ===== **/
  const mentors = useMemo(
    () =>
      submissions
        .filter((e) => e.role === "mentor")
        .sort(sortBySeenFirst),
    [submissions, connections]
  );

  const mentees = useMemo(
    () =>
      submissions
        .filter((e) => e.role === "mentee")
        .sort(sortBySeenFirst),
    [submissions, connections]
  );

  /** ===== HANDLERS ===== **/
  const handleSubmit = async (payload, editingId) => {
    try {
      if (editingId) {
        if (user?.uid !== editingEntry?.userId) {
          alert("You can only edit your own submissions.");
          return;
        }
        await updateMentorshipSubmission(db, editingId, payload);
        alert("Mentorship info updated!");
      } else {
        await createMentorshipSubmission(db, payload);
        alert("Mentorship info submitted!");
      }
      setEditingEntry(null);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit mentorship info.");
    }
  };

  const handleEdit = (entry) => {
    if (user?.uid !== entry.userId) {
      alert("You can only edit your own submissions.");
      return;
    }
    setEditingEntry(entry);
  };

  const handleDelete = async (id, ownerId) => {
    if (user?.uid !== ownerId) {
      alert("You can only delete your own submissions.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      await deleteMentorshipSubmission(db, id);
      alert("Submission deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete submission.");
    }
  };

  const handleRequestConnection = async (targetUserId) => {
    if (!user) return alert("Please log in first");
    if (targetUserId === user.uid) return alert("You cannot connect with yourself.");
    if (connectionExists(connections, user.uid, targetUserId)) {
      alert("Connection request already exists.");
      return;
    }
    try {
      await requestConnection(db, user.uid, targetUserId);
      alert("Connection request sent!");
    } catch (err) {
      console.error("Failed to send connection request:", err);
      alert("Failed to send connection request.");
    }
  };

  /** ===== RENDER ===== **/
  if (loading) return <p className="loading-text">Loading mentorship submissions...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="mentorship-container">
      {/* Left Section */}
      <section className="mentorship-main">
        <header className="mentorship-header">
          <h1 className="title">Mentorship Hub</h1>
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
          getStatusFor={getStatusFor}
        />
      </section>

      {/* Right Panel */}
      <aside className="mentorship-side">
        <div className="panel-box">
          <h3>🧑‍🏫 Mentors</h3>
          {mentors.length === 0 ? (
            <p className="empty-text">No mentors yet.</p>
          ) : (
            mentors.map((m) => {
              const status = getStatusFor(m.userId);
              return (
                <div key={m.id} className="panel-item">
                  <span className="name">{m.name || "Unnamed"}</span>
                  <span className={`status status-${status || "none"}`}>
                    {status === "accepted" ? "Seen" : "Not Seen"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="panel-box">
          <h3>🎓 Mentees</h3>
          {mentees.length === 0 ? (
            <p className="empty-text">No mentees yet.</p>
          ) : (
            mentees.map((m) => {
              const status = getStatusFor(m.userId);
              return (
                <div key={m.id} className="panel-item">
                  <span className="name">{m.name || "Unnamed"}</span>
                  <span className={`status status-${status || "none"}`}>
                    {status === "accepted" ? "Seen" : "Not Seen"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
