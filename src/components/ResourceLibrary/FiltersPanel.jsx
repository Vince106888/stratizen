import React, { useState } from "react";

const FiltersPanel = ({
  schools,
  subjects,
  selectedSchool,
  setSelectedSchool,
  selectedSubject,
  setSelectedSubject,
}) => {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <aside className="resource-filters-panel flex-shrink-0 p-6 bg-white shadow-md rounded-xl m-4 w-full lg:w-72 animate-slideIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="panel-title text-strath-blue font-semibold">Filters</h2>
        <button
          className="lg:hidden text-sm text-strath-red"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide" : "Show"}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-4">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="panel-select"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="panel-select"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSelectedSchool("");
              setSelectedSubject("");
            }}
            className="panel-btn"
          >
            Clear Filters
          </button>
        </div>
      )}
    </aside>
  );
};

export default FiltersPanel;
