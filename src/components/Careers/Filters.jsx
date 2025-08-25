import React from "react";
import '../../styles/Careers/Filters.css'; // Import the CSS file

const options = ["All", "Remote", "Internship", "Part-time", "Volunteer", "Leadership", "Community"];

export default function Filters({ filter, setFilter }) {
  return (
    <div className="filters-wrapper">
      {options.map((opt, i) => (
        <button
          key={i}
          className={`filter-btn ${filter === opt ? 'active' : ''}`}
          onClick={() => setFilter(opt)}
          aria-pressed={filter === opt}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
