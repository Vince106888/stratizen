import React from "react";
import "../../styles/Innovation/Mentors.css";

const mentors = [
  { name: "Mentor 1", expertise: "Frontend Dev, UX Design" },
  { name: "Mentor 2", expertise: "AI, Machine Learning" },
  { name: "Mentor 3", expertise: "Business Strategy, Marketing" }
];

const Mentors = () => (
  <section className="mentors panel">
    <h2>🤝 Mentors & Collaborators</h2>
    <div className="mentors-grid">
      {mentors.map((mentor, i) => (
        <div key={i} className="mentor-card">
          <div className="mentor-info">
            <h3>{mentor.name}</h3>
            <p>Looking for: {mentor.expertise}</p>
          </div>
          <button className="mentor-btn">Message</button>
        </div>
      ))}
    </div>
  </section>
);

export default Mentors;
