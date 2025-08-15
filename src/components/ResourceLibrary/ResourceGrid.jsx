import React from "react";

const ResourceGrid = ({ resources, ResourceCard }) => {
  if (resources.length === 0) {
    return (
      <p className="text-center mt-8 text-gray-500">
        No resources found for the selected filters.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
      {resources.map((r) => (
        <div key={r.id} className="animate-fadeIn">
          <ResourceCard resource={r} />
        </div>
      ))}
    </div>
  );
};

export default ResourceGrid;
