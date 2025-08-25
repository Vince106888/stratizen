import React from "react";

const Filters = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  toggleForm,
  showForm,
}) => {
  return (
    <div className="filter-container">
      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.trimStart())}
        placeholder="Search listings..."
        className="search-input"
        aria-label="Search listings"
      />

      {/* Category Filter */}
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="filter-select"
        aria-label="Filter by category"
      >
        <option value="All">All Categories</option>
        <option value="General">General</option>
        <option value="Books">Books</option>
        <option value="Electronics">Electronics</option>
        <option value="Services">Services</option>
      </select>

      {/* Toggle Create Form */}
      <button
        onClick={toggleForm}
        className={`create-btn ${showForm ? "cancel-btn" : ""}`}
        aria-expanded={showForm}
      >
        {showForm ? "Cancel" : "Create New Listing"}
      </button>
    </div>
  );
};

export default Filters;
