import React from "react";

const SidePanel = () => {
  const featuredItems = [
    { icon: "📚", text: "Discounted textbooks" },
    { icon: "💻", text: "Affordable electronics" },
    { icon: "🎓", text: "Student services" },
    { icon: "🌍", text: "Cross-campus connections" },
  ];

  return (
    <aside className="marketplace-side-panel">
      <h3 className="side-panel-title">Featured</h3>
      <p className="side-panel-subtitle">🚀 Special deals for students across Africa!</p>
      <ul className="side-panel-list">
        {featuredItems.map((item, idx) => (
          <li key={idx} className="side-panel-item">
            <span className="side-panel-icon">{item.icon}</span> {item.text}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidePanel;
