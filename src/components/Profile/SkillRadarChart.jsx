import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import "../../styles/Profile/SkillRadarChart.css";

export default function SkillRadarChart({
  title,
  data,
  width = 600,
  height = 600,
  strokeColor = "#2563eb",
  fillColor = "#2563eb",
  fillOpacity = 0.6,
}) {
  return (
    <section
      aria-label={`${title} radar chart`}
      style={{
        width,
        height,
        maxWidth: "100%",
        margin: "0 auto 2rem auto",
        backgroundColor: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        padding: "1rem",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          fontWeight: 600,
          color: strokeColor,
        }}
      >
        {title}
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          role="img"
          aria-label={`${title} skill radar chart showing skill proficiency`}
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }} // <-- Add margin here
        >
          <PolarGrid stroke="#ddd" />
          <PolarAngleAxis
            dataKey="skill"
            stroke="#444"
            tick={{ fontSize: 10, fill: "#333", fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickCount={6}
            stroke="#bbb"
            tick={{ fontSize: 8, fill: "#666" }}
          />
          <Radar
            name="Skill Score"
            dataKey="score"
            stroke={strokeColor}
            fill={fillColor}
            fillOpacity={fillOpacity}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
          <Tooltip
            formatter={(value) => `${value.toFixed(0)} pts`}
            contentStyle={{
              backgroundColor: "#f9f9f9",
              borderRadius: 8,
              borderColor: "#ddd",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            cursor={{ stroke: strokeColor, strokeWidth: 2 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: 13, color: "#555" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </section>
  );
}
