import React, { useState } from "react";
import { postSuggestion } from "../../services/noticeboardService";

export default function SuggestNoticeForm({ user, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await postSuggestion(user, { title, content });
      setTitle("");
      setContent("");
      setSuccess("Suggestion submitted for review.");
    } catch (err) {
      console.error(err);
      setError("Failed to submit suggestion. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggest-modal fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="suggest-card bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-primary text-xl font-semibold mb-4">Suggest a Notice</h2>

        {error && <p className="text-danger mb-2">{error}</p>}
        {success && <p className="text-accent mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={4}
            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white font-semibold rounded py-2 hover:bg-primary-dark transition"
          >
            {loading ? "Submitting..." : "Suggest Notice"}
          </button>
        </form>
      </div>
    </div>
  );
}
