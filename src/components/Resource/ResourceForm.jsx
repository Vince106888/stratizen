import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

const ResourceForm = ({ schools, subjects, onResourceAdded }) => {
  const [form, setForm] = useState({
    title: "",
    url: "",
    schoolId: "",
    subjectId: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!form.title || !form.url || !form.schoolId || !form.subjectId) {
      setAlert({ type: "error", message: "⚠️ Please fill in all fields." });
      return;
    }

    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "resources"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      setAlert({ type: "success", message: "✅ Resource added successfully!" });
      setForm({ title: "", url: "", schoolId: "", subjectId: "" });

      if (onResourceAdded) onResourceAdded({ id: docRef.id, ...form });
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "❌ Failed to add resource. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <h2 className="text-xl font-semibold text-strathBlue mb-2">
        📚 Add New Resource
      </h2>

      {alert.message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm animate-fadeIn ${
            alert.type === "success"
              ? "bg-green-100 border border-green-300 text-green-700"
              : "bg-red-100 border border-red-300 text-red-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      <input
        type="text"
        placeholder="Resource Title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:ring-2 focus:ring-strathBlue focus:outline-none"
      />

      <input
        type="url"
        placeholder="Resource URL"
        value={form.url}
        onChange={(e) => handleChange("url", e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:ring-2 focus:ring-strathBlue focus:outline-none"
      />

      <select
        value={form.schoolId}
        onChange={(e) => handleChange("schoolId", e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:ring-2 focus:ring-strathBlue focus:outline-none"
      >
        <option value="">Select School</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={form.subjectId}
        onChange={(e) => handleChange("subjectId", e.target.value)}
        className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:ring-2 focus:ring-strathBlue focus:outline-none"
      >
        <option value="">Select Subject</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-3 rounded-lg font-medium text-white transition-transform duration-200 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-strathBlue hover:bg-blue-900 hover:-translate-y-0.5"
        }`}
      >
        {loading ? "Adding..." : "➕ Add Resource"}
      </button>
    </form>
  );
};

export default ResourceForm;
