import React, { useState } from "react";
import "../../styles/ResourceLibrary/FiltersPanel.css";

const FiltersPanel = ({
  schools,
  subjects,
  selectedSchool,
  setSelectedSchool,
  selectedSubject,
  setSelectedSubject,
  search,
  setSearch,
  sortBy,
  setSortBy,
  onClear,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <section
      className={`filters-panel shadow-md rounded-xl p-6 m-4 transition-all duration-300 ${
        open ? "open" : "closed"
      }`}
      aria-label="Filters"
    >
      {/* Header */}
      <div className="filters-header flex items-center justify-between">
        <h2 className="filters-title">Filters</h2>
        <button
          className="toggle-btn md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {/* Body */}
      {open && (
        <div className="filters-body mt-4 grid gap-4">
          {/* Search */}
          <label className="form-group">
            <span className="form-label">Search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find notes, papers, links…"
              className="input"
            />
          </label>

          {/* School */}
          <label className="form-group">
            <span className="form-label">School</span>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="input"
            >
              <option value="">All Schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          {/* Subject */}
          <label className="form-group">
            <span className="form-label">Subject</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          {/* Sort */}
          <label className="form-group">
            <span className="form-label">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="newest">Newest</option>
              <option value="title">Title (A–Z)</option>
              <option value="popular">Most Viewed</option>
            </select>
          </label>

          {/* Actions */}
          <div className="filters-actions flex gap-3">
            <button className="btn-primary" onClick={onClear}>
              Clear Filters
            </button>
            <a href="#content" className="btn-ghost">
              Skip to Results
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default FiltersPanel;
