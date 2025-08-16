import React from "react";

const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const { title, description, link, schoolName, subjectName } = resource;

  return (
    <div className="relative flex flex-col justify-between bg-white rounded-xl shadow-md p-5 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl group">
      {/* Header */}
      <div className="mb-2">
        <h3
          className="text-lg font-semibold text-strathBlue truncate"
          title={title}
        >
          {title || "Untitled Resource"}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
        {description?.slice(0, 120) || "No description available."}
        {description && description.length > 120 && "…"}
      </p>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {schoolName && (
          <span className="bg-strathGold text-black px-2 py-1 rounded-md text-xs font-semibold">
            {schoolName}
          </span>
        )}
        {subjectName && (
          <span className="bg-strathGold text-black px-2 py-1 rounded-md text-xs font-semibold">
            {subjectName}
          </span>
        )}
      </div>

      {/* Link */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-strathBlue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
        >
          🔗 View Resource
        </a>
      )}

      {/* Hover Overlay / Action Buttons */}
      <div className="absolute inset-0 bg-white/95 flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onEdit && onEdit(resource)}
          className="px-4 py-2 rounded-lg bg-strathBlue text-white font-semibold text-sm hover:bg-blue-900 transition"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete && onDelete(resource)}
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-800 transition"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
