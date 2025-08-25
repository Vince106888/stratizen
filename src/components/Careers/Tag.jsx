import React from "react";

export default function Tag({ text }) {
  const colors = {
    Remote: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    Internship: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    Volunteer: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    "Part-time": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
    Leadership: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    Community: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${
        colors[text] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      }`}
    >
      {text}
    </span>
  );
}
