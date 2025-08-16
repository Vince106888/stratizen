import React from "react";
import "../../styles/Innovation/FeaturedProjects.css";

const projects = [
  { title: "AI Study Assistant", tags: ["AI", "Education", "Web"], github: "https://github.com/user/ai-study-assistant" },
  { title: "Green Campus App", tags: ["Environment", "App"], github: "https://github.com/user/green-campus-app" },
  { title: "PeerLearn Platform", tags: ["Education", "Collaboration"], github: "https://github.com/user/peerlearn-platform" }
];

const FeaturedProjects = () => (
  <section className="featured-projects panel">
    <h2>🌟 Featured Projects</h2>
    <div className="projects-grid">
      {projects.map((project, i) => (
        <div key={i} className="project-card">
          <div className="project-info">
            <h3>{project.title}</h3>
            <div className="tags">
              {project.tags.map((tag, j) => (
                <span key={j} className="tag">{tag}</span>
              ))}
            </div>
            <span className="status">Status: Prototype</span>
          </div>
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="github-btn">
            View on GitHub
          </a>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturedProjects;
