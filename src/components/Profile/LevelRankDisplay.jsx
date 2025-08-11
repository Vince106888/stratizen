import React from "react";

export default function LevelRankDisplay({ totalXP, level, rank }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
      <h2>User Level & Rank</h2>
      <p>
        Total XP: <strong>{totalXP}</strong>
      </p>
      <p>
        Level: <strong>{level}</strong>
      </p>
      <p>
        Rank: <strong>{rank}</strong>
      </p>
    </div>
  );
}
