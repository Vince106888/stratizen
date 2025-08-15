// src/components/Noticeboard/NoticeFilters.jsx
import React, { useState } from "react";
import "../../styles/Noticeboard/NoticeFilters.css";

export default function NoticeFilters({ notices = [], onFilter }) {
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("");
  const [group, setGroup] = useState("");
  const [club, setClub] = useState("");

  const schools = ["SCES", "SIMS", "SBS", "STH", "SHSS", "SI", "SLS", "SOA"];
  const years = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
  const groups = ["Computer Science", "Economics", "Business", "Law", "Engineering"];
  const clubs = ["Chess Club", "Drama", "Debate", "Robotics"];

  const filters = [
    { label: "School", value: school, setter: setSchool, options: schools, placeholder: "Select School" },
    { label: "Year", value: year, setter: setYear, options: years, placeholder: "Select Year" },
    { label: "Group/Course", value: group, setter: setGroup, options: groups, placeholder: "Select Group/Course" },
    { label: "Club/Community", value: club, setter: setClub, options: clubs, placeholder: "Select Club/Community" },
  ];

  const handleApply = () => {
    let filtered = [...notices];
    if (school) filtered = filtered.filter(n => n.school === school);
    if (year) filtered = filtered.filter(n => n.year === year);
    if (group) filtered = filtered.filter(n => n.group === group);
    if (club) filtered = filtered.filter(n => n.club === club);
    onFilter(filtered);
  };

  return (
    <div className="notice-filters-container">
      {filters.map(f => (
        <div key={f.label} className="filter-card">
          <label className="filter-title">{f.label}</label>
          <select
            value={f.value}
            onChange={e => f.setter(e.target.value)}
            className="filter-select"
          >
            <option value="">{f.placeholder}</option>
            {f.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      <button className="apply-filter-btn" onClick={handleApply}>
        Apply Filters
      </button>
    </div>
  );
}
