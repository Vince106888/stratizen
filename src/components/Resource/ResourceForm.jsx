import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../../styles/Resource/ResourceForm.css";

const ResourceForm = ({ schools, subjects, onResourceAdded }) => {
  const [form, setForm] = useState({
    title: "",
    url: "",
    schoolId: "",
    subjectId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.url || !form.schoolId || !form.subjectId) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "resources"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      setSuccess("Resource added successfully!");
      setForm({ title: "", url: "", schoolId: "", subjectId: "" });

      // Optional callback to update parent state instantly
      if (onResourceAdded) onResourceAdded({ id: docRef.id, ...form });
    } catch (err) {
      console.error(err);
      setError("Failed to add resource. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="resource-form space-y-4 p-4 bg-white rounded-lg shadow-md">
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <input
        type="text"
        placeholder="Resource Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="resource-input"
      />

      <input
        type="url"
        placeholder="Resource URL"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        className="resource-input"
      />

      <select
        value={form.schoolId}
        onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
        className="resource-input"
      >
        <option value="">Select School</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        value={form.subjectId}
        onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
        className="resource-input"
      >
        <option value="">Select Subject</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <button
        type="submit"
        className={`resource-btn ${loading ? "loading" : ""}`}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Resource"}
      </button>
    </form>
  );
};

export default ResourceForm;
