import React from "react";
import "../../styles/Innovation/ResourceLibrary.css";

const resources = [
  { name: "Prototyping Tools", link: "#" },
  { name: "Startup Legal Guide (PDF)", link: "#" },
  { name: "Pitching 101 (Video)", link: "#" }
];

const ResourceLibrary = () => (
  <section className="resource-library panel">
    <h2>📚 Resource Library</h2>
    <ul className="resource-list">
      {resources.map((res, i) => (
        <li key={i}>
          <a href={res.link} target="_blank" rel="noopener noreferrer">{res.name}</a>
        </li>
      ))}
    </ul>
  </section>
);

export default ResourceLibrary;
