import React, { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import '../styles/Mentorship.css';


function Mentorship() {
  const [role, setRole] = useState("mentor");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "mentorship"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
      setLoading(false);
    }, (err) => {
      setError("Failed to load mentorship submissions.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "connections"),
      where("participants", "array-contains", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConnections(data);
    });
    return () => unsubscribe();
  }, [user]);

  const resetForm = () => {
    setSkills("");
    setDescription("");
    setRole("mentor");
    setEditingId(null);
  };

  const validateForm = () => {
    if (!skills.trim()) {
      alert("Please enter at least one skill.");
      return false;
    }
    if (description.trim().length < 10) {
      alert("Description should be at least 10 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in first");
    if (!validateForm()) return;

    try {
      if (editingId) {
        const docRef = doc(db, "mentorship", editingId);
        await updateDoc(docRef, {
          role,
          skills: skills.split(",").map((s) => s.trim()),
          description,
          updatedAt: serverTimestamp(),
        });
        alert("Mentorship info updated!");
      } else {
        await addDoc(collection(db, "mentorship"), {
          userId: user.uid,
          name: user.displayName || "Anonymous",
          email: user.email,
          role,
          skills: skills.split(",").map((s) => s.trim()),
          description,
          createdAt: serverTimestamp(),
        });
        alert("Mentorship info submitted!");
      }
      resetForm();
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
    setRole(entry.role);
    setSkills(entry.skills.join(", "));
    setDescription(entry.description);
    setEditingId(entry.id);
  };

  const handleDelete = async (id, ownerId) => {
    if (user?.uid !== ownerId) {
      alert("You can only delete your own submissions.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await deleteDoc(doc(db, "mentorship", id));
        alert("Submission deleted.");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete submission.");
      }
    }
  };

  const connectionExists = (targetUserId) => {
    return connections.some(
      (conn) =>
        (conn.requesterId === user.uid && conn.targetId === targetUserId) ||
        (conn.requesterId === targetUserId && conn.targetId === user.uid)
    );
  };

  const getConnectionStatus = (targetUserId) => {
    const conn = connections.find(
      (conn) =>
        (conn.requesterId === user.uid && conn.targetId === targetUserId) ||
        (conn.requesterId === targetUserId && conn.targetId === user.uid)
    );
    return conn ? conn.status : null;
  };

  const handleRequestConnection = async (targetUserId) => {
    if (!user) return alert("Please log in first");
    if (targetUserId === user.uid) {
      alert("You cannot connect with yourself.");
      return;
    }
    if (connectionExists(targetUserId)) {
      alert("Connection request already exists.");
      return;
    }
    try {
      await addDoc(collection(db, "connections"), {
        requesterId: user.uid,
        targetId: targetUserId,
        status: "pending",
        createdAt: serverTimestamp(),
        participants: [user.uid, targetUserId],
      });
      alert("Connection request sent!");
    } catch (err) {
      console.error("Failed to send connection request:", err);
      alert("Failed to send connection request.");
    }
  };

  if (loading) return <p>Loading mentorship submissions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const oppositeRole = role === "mentor" ? "mentee" : "mentor";
  const relevantSubmissions = submissions.filter((entry) => entry.role === oppositeRole);

  return (
    <div className="forum-container">
      <h1 className="forum-header">Mentorship Hub</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {role === "mentor" ? "🧑‍🏫 Become a Mentor" : "🎓 Find a Mentor"}
        </h2>

        <div>
          <label className="block font-semibold mb-1">I am a:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
          >
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 mt-4">
            {role === "mentor" ? "Skills You Can Offer (comma-separated):" : "Skills You Want to Learn (comma-separated):"}
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 mt-4">
            {role === "mentor" ? "Mentoring Philosophy / Bio:" : "Your Goals / Bio:"}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows={4}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary mt-4">
          {editingId ? "Update My Submission" : "Submit as " + role}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-secondary mt-4 ml-4"
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className="section-title mb-2">
        {role === "mentor" ? "🎓 Available Mentees" : "🧑‍🏫 Available Mentors"}
      </h2>

      <div className="topics-list">
        {relevantSubmissions.length === 0 && <p>No {oppositeRole}s found yet.</p>}
        {relevantSubmissions.map((entry) => (
          <div key={entry.id} className="topic-card">
            <h3 className="topic-title">
              {entry.name} ({entry.role})
            </h3>
            <p className="topic-meta">{entry.email}</p>
            <p><strong>Skills:</strong> {entry.skills?.join(", ")}</p>
            <p><strong>About:</strong> {entry.description}</p>

            {user?.uid === entry.userId && (
              <div className="mt-2 flex gap-2">
                <button onClick={() => handleEdit(entry)} className="btn btn-sm btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(entry.id, entry.userId)} className="btn btn-sm btn-danger">
                  Delete
                </button>
              </div>
            )}

            {user && user.uid !== entry.userId && (
              !connectionExists(entry.userId) ? (
                <button onClick={() => handleRequestConnection(entry.userId)} className="btn btn-sm btn-primary mt-2">
                  Request Connection
                </button>
              ) : (
                <p className="mt-2 text-gray-600">
                  Connection {getConnectionStatus(entry.userId)}
                </p>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mentorship;
