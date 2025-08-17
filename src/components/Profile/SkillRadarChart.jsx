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

import { useTheme } from "../../context/ThemeContext";
import "../../styles/Profile/SkillRadarChart.css";

// Define a palette for multiple radar series
const radarColors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function SkillRadarChart({
  title,
  data = [],
  width = 500,
  height = 500,
  fillOpacity = 0.7,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={`skill-radar-chart-section ${isDark ? "dark-mode" : ""}`}
      aria-label={`${title} radar chart`}
      style={{
        backgroundColor: isDark ? "#111827" : "#fff",
        color: isDark ? "#e5e7eb" : "#1f2937",
        boxShadow: isDark
          ? "0 6px 20px rgba(0,0,0,0.5)"
          : "0 6px 20px rgba(0,0,0,0.12)",
      }}
    >
      <h3
        className="skill-radar-chart-title"
        style={{ color: radarColors[0] }}
      >
        {title}
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          role="img"
          aria-label={`${title} skill radar chart showing skill proficiency`}
          margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        >
          <PolarGrid stroke={isDark ? "#374151" : "#ddd"} />
          <PolarAngleAxis
            dataKey="skill"
            stroke={isDark ? "#d1d5db" : "#2a2a2a"}
            tick={{
              fontSize: 14,
              fill: isDark ? "#e5e7eb" : "#2a2a2a",
              fontWeight: 700,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickCount={6}
            stroke={isDark ? "#6b7280" : "#555"}
            tick={{
              fontSize: 12,
              fill: isDark ? "#d1d5db" : "#555",
              fontWeight: 500,
            }}
          />

          {/* Render multiple radars dynamically with distinct colors */}
          {data.map((radarSeries, idx) => (
            <Radar
              key={idx}
              name={radarSeries.name || `Radar ${idx + 1}`}
              dataKey={radarSeries.dataKey || "score"}
              stroke={radarColors[idx % radarColors.length]}
              fill={radarColors[idx % radarColors.length]}
              fillOpacity={fillOpacity}
              dot={{ strokeWidth: 3 }}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          ))}

          <Tooltip
            formatter={(value) => `${value.toFixed(0)} pts`}
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#f9f9f9",
              color: isDark ? "#e5e7eb" : "#000",
              borderRadius: 8,
              borderColor: "#ddd",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            cursor={{ stroke: radarColors[0], strokeWidth: 2 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              fontSize: 13,
              color: isDark ? "#e5e7eb" : "#555",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </section>
  );
}
