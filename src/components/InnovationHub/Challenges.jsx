import React from "react";
import "../../styles/Innovation/Challenges.css";

const challenges = [
  { title: "Hackathon 1", deadline: "July 10", teamSize: "Up to 4", prize: "$500" },
  { title: "Hackathon 2", deadline: "Aug 5", teamSize: "Up to 5", prize: "$1000" }
];

const Challenges = () => (
  <section className="challenges-section panel">
    <h2>🏆 Innovation Challenges</h2>
    <ul className="challenges-list">
      {challenges.map((c, i) => (
        <li key={i} className="challenge-card">
          <div className="challenge-info">
            <h3>{c.title}</h3>
            <p>Deadline: {c.deadline} | Team Size: {c.teamSize} | Prize: {c.prize}</p>
          </div>
          <button className="register-btn">Register</button>
        </li>
      ))}
    </ul>
  </section>
);

export default Challenges;
