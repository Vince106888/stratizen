import React from "react";

const LeftLinksPanel = ({ resources }) => {
  return (
    <aside className="resource-links-panel hidden md:block flex-shrink-0 p-6 bg-white shadow-md rounded-xl m-4 w-64">
      <h2 className="panel-title mb-4 text-strath-blue font-semibold">
        🔗 Quick Links
      </h2>
      <ul className="space-y-2">
        {resources.slice(0, 10).map((r) => (
          <li key={r.id}>
            <a
              href={r.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-strath-red hover:underline transition-colors"
            >
              {r.title.length > 25 ? r.title.slice(0, 25) + "..." : r.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default LeftLinksPanel;
