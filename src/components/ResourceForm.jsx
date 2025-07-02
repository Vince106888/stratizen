import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const ResourceForm = ({ schools, subjects }) => {
  const [form, setForm] = useState({
    title: "",
    url: "",
    schoolId: "",
    subjectId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url || !form.schoolId || !form.subjectId) return;

    await addDoc(collection(db, "resources"), {
      ...form,
      createdAt: serverTimestamp(),
    });

    setForm({ title: "", url: "", schoolId: "", subjectId: "" });
    alert("Resource added!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        className="p-2 border w-full"
      />
      <input
        type="url"
        placeholder="URL"
        value={form.url}
        onChange={e => setForm({ ...form, url: e.target.value })}
        className="p-2 border w-full"
      />
      <select onChange={e => setForm({ ...form, schoolId: e.target.value })} className="p-2 border w-full">
        <option value="">Select School</option>
        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <select onChange={e => setForm({ ...form, subjectId: e.target.value })} className="p-2 border w-full">
        <option value="">Select Subject</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">Add</button>
    </form>
  );
};

export default ResourceForm;
