import React, { useEffect, useMemo, useState } from "react";
import {
  fetchResources,
  fetchSchools,
  fetchSubjects,
} from "../services/resourceService";

import ResourceForm from "../components/Resource/ResourceForm";
import ResourceCard from "../components/Resource/ResourceCard";

import FiltersPanel from "../components/ResourceLibrary/FiltersPanel";
import HighlightsPanel from "../components/ResourceLibrary/HighlightsPanel";
import ResourceGrid from "../components/ResourceLibrary/ResourceGrid";

import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import "../styles/ResourceLibrary.css"; // Import the dedicated CSS

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [hoverFilter, setHoverFilter] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resData, schoolData, subjData] = await Promise.all([
          fetchResources(),
          fetchSchools(),
          fetchSubjects(),
        ]);
        setResources(resData);
        setSchools(schoolData);
        setSubjects(subjData);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to load resources. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredResources = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = resources.filter(
      (r) =>
        (!selectedSchool || r.schoolId === selectedSchool) &&
        (!selectedSubject || r.subjectId === selectedSubject) &&
        (!term ||
          r.title?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term))
    );

    switch (sortBy) {
      case "title":
        return [...list].sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
      case "popular":
        return [...list].sort(
          (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
        );
      default:
        return [...list].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }
  }, [resources, selectedSchool, selectedSubject, search, sortBy]);

  const handleResourceAdded = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
  };

  return (
    <div className="resource-lib-page">
      {/* ---------- Main Column ---------- */}
      <section className="main-column">
        <div className="main-panel">
          {/* Header */}
          <header className="resource-header">
            <h1 className="resource-title">📚 Resource Library</h1>
            <div className="header-actions">
              <div
                className="filter-toggle"
                onMouseEnter={() => setHoverFilter(true)}
                onMouseLeave={() => setHoverFilter(false)}
              >
                <button
                  className="filter-btn"
                  onClick={() => setShowFilter(true)}
                >
                  <FunnelIcon className="icon" />
                  <span className="filter-label">Filter</span>
                </button>
                {hoverFilter && (
                  <div className="filter-hover-box">
                    <FiltersPanel
                      schools={schools}
                      subjects={subjects}
                      selectedSchool={selectedSchool}
                      setSelectedSchool={setSelectedSchool}
                      selectedSubject={selectedSubject}
                      setSelectedSubject={setSelectedSubject}
                      search={search}
                      setSearch={setSearch}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      onClear={() => {
                        setSelectedSchool("");
                        setSelectedSubject("");
                        setSearch("");
                        setSortBy("newest");
                      }}
                    />
                  </div>
                )}
              </div>
              <span className="result-count">
                {filteredResources.length} result
                {filteredResources.length !== 1 ? "s" : ""}
              </span>
            </div>
          </header>

          {/* Loading & Error */}
          {loading && (
            <div className="loading-box">
              <div className="loader"></div>
              <p>Loading resources…</p>
            </div>
          )}
          {error && <div className="alert">{error}</div>}

          {/* Grid */}
          {!loading && (
            <ResourceGrid
              resources={filteredResources}
              ResourceCard={ResourceCard}
            />
          )}

          {/* Add Resource */}
          <section className="add-resource-panel">
            <h2>Add Resource</h2>
            <ResourceForm
              schools={schools}
              subjects={subjects}
              onResourceAdded={handleResourceAdded}
            />
          </section>
        </div>
      </section>

      {/* ---------- Right Panel ---------- */}
      <aside className="right-panel">
        <div className="highlights-panel">
          <HighlightsPanel resources={resources} subjects={subjects} />
        </div>
      </aside>

      {/* ---------- Full Filter Overlay ---------- */}
      {showFilter && (
        <div className="filter-overlay">
          <div className="filter-box">
            <div className="filter-header">
              <h2>Filter Resources</h2>
              <button className="close-btn" onClick={() => setShowFilter(false)}>
                <XMarkIcon className="icon" />
              </button>
            </div>
            <FiltersPanel
              schools={schools}
              subjects={subjects}
              selectedSchool={selectedSchool}
              setSelectedSchool={setSelectedSchool}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClear={() => {
                setSelectedSchool("");
                setSelectedSubject("");
                setSearch("");
                setSortBy("newest");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
