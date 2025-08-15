import React from "react";

const RightHighlightsPanel = () => {
  return (
    <aside className="resource-highlights-panel hidden lg:block flex-shrink-0 p-6 bg-white shadow-md rounded-xl m-4 w-64 animate-slideInRight">
      <h2 className="panel-title mb-4 text-strath-blue font-semibold">
        Highlights
      </h2>
      <ul className="right-panel-list space-y-2">
        <li className="panel-item">🔥 Most viewed resources</li>
        <li className="panel-item">⭐ Editor’s pick</li>
        <li className="panel-item">📈 Trending subjects</li>
      </ul>
    </aside>
  );
};

export default RightHighlightsPanel;
