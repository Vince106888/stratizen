import React from "react";
import Tag from "./Tag";
import '../../styles/Careers/RoleCard.css';

export default function RoleCard({ role }) {
  return (
    <div className="role-card group p-6 rounded-xl bg-white dark:bg-gray-900 shadow hover:shadow-xl transition-transform hover:-translate-y-1">
      <h3 className="role-title text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {role.title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300">{role.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {role.tags.map((tag, idx) => (
          <Tag key={idx} text={tag} />
        ))}
      </div>

      <a
        href={role.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
      >
        Apply
      </a>
    </div>
  );
}
