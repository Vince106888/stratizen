import React from "react";

export default function Tag({ text }) {
  const colors = {
    Remote: "bg-green-100 text-green-800",
    Internship: "bg-blue-100 text-blue-800",
    Volunteer: "bg-yellow-100 text-yellow-800",
    "Part-time": "bg-purple-100 text-purple-800", // <-- key quoted
    Leadership: "bg-red-100 text-red-800",
    Community: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`px-2 py-1 text-sm font-medium rounded-full ${
        colors[text] || "bg-gray-100 text-gray-800"
      }`}
    >
      {text}
    </span>
  );
}
