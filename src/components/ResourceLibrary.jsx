import React, { useEffect, useState, useMemo } from "react";
import { fetchResources, fetchSchools, fetchSubjects } from "../services/resourceService";
import ResourceForm from "../components/Resource/ResourceForm";
import ResourceCard from "../components/Resource/ResourceCard";
import LeftLinksPanel from "../components/ResourceLibrary/LeftLinksPanel";
import FiltersPanel from "../components/ResourceLibrary/FiltersPanel";
import RightHighlightsPanel from "../components/ResourceLibrary/RightHighlightsPanel";
import ResourceGrid from "../components/ResourceLibrary/ResourceGrid";
import "../styles/ResourceLibrary.css";

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const filteredResources = useMemo(
    () =>
      resources.filter(
        (r) =>
          (!selectedSchool || r.schoolId === selectedSchool) &&
          (!selectedSubject || r.subjectId === selectedSubject)
      ),
    [resources, selectedSchool, selectedSubject]
  );

  const handleResourceAdded = (newResource) => {
    setResources((prev) => [newResource, ...prev]);
  };

  return (
    <div className="resource-library-wrapper flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Links Panel */}
      <LeftLinksPanel resources={resources} />

      {/* Filters + Main */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Filters Panel */}
        <FiltersPanel
          schools={schools}
          subjects={subjects}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
        />

        {/* Main Content */}
        <main className="resource-main flex-1 p-6 m-4 bg-white shadow-md rounded-xl animate-fadeIn">
          <h1 className="resource-title mb-6 text-strath-blue font-bold text-2xl flex items-center gap-2">
            📚 Resource Library
          </h1>

          {/* Loading/Error */}
          {loading && (
            <div className="flex justify-center items-center mt-8">
              <div className="loader"></div>
              <span className="ml-3 text-gray-600">Loading resources...</span>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Resource Grid */}
          {!loading && (
            <ResourceGrid
              resources={filteredResources}
              ResourceCard={ResourceCard}
            />
          )}

          {/* Add Resource */}
          <div className="mt-12">
            <h2 className="section-title mb-4">➕ Add Resource</h2>
            <ResourceForm
              schools={schools}
              subjects={subjects}
              onResourceAdded={handleResourceAdded}
            />
          </div>
        </main>
      </div>

      {/* Right Highlights Panel */}
      <RightHighlightsPanel />
    </div>
  );
};

export default ResourceLibrary;
