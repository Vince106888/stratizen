import React, { useState } from "react";
import "../../styles/Innovation/ProjectExplorer.css";

const projectsList = [
  { id: 1, title: "Project 1", description: "Description of project 1...", owner: "Student 1", status: "Idea", github: "#" },
  { id: 2, title: "Project 2", description: "Description of project 2...", owner: "Student 2", status: "Prototype", github: "#" },
  { id: 3, title: "Project 3", description: "Description of project 3...", owner: "Student 3", status: "MVP", github: "#" }
];

const ProjectExplorer = () => {
  const [category, setCategory] = useState("All Categories");
  const [level, setLevel] = useState("All Levels");

  const filteredProjects = projectsList.filter(p =>
    (category === "All Categories" || p.tags?.includes(category)) &&
    (level === "All Levels" || p.status === level)
  );

  return (
    <section className="project-explorer panel">
      <h2>🔍 Project Library</h2>
      <div className="filters flex flex-wrap gap-4 mb-4">
        <select onChange={e => setCategory(e.target.value)} value={category}>
          <option>All Categories</option>
          <option>AI</option>
          <option>Health</option>
          <option>Finance</option>
        </select>
        <select onChange={e => setLevel(e.target.value)} value={level}>
          <option>All Levels</option>
          <option>Idea</option>
          <option>Prototype</option>
          <option>MVP</option>
        </select>
      </div>
      <div className="projects-grid">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <span className="status">Owner: {project.owner} | Status: {project.status}</span>
            </div>
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="github-btn">
              View on GitHub
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectExplorer;
