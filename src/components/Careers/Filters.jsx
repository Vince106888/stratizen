import React from "react";

const options = ["All", "Remote", "Internship", "Part-time", "Volunteer", "Leadership", "Community"];

export default function Filters({ filter, setFilter }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => (
        <button
          key={i}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === opt ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          } hover:bg-blue-500 hover:text-white transition`}
          onClick={() => setFilter(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
