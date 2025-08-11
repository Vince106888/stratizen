import React, { useEffect } from "react";
import SkillRadarChart from "./SkillRadarChart";
import LevelRankDisplay from "./LevelRankDisplay";
import { SOFT_SKILLS, TECHNICAL_SKILLS } from "../../constants/skills";
import {
  calculateSkillScore,
  calculateTotalXP,
  calculateLevel,
  calculateRank,
} from "../../utils/xpUtils";

export default function ProfileSkills({ form, onChange }) {
  const xpData = form.xp || {};

  // Calculate total XP, level, and rank
  const totalXP = calculateTotalXP(xpData);
  const level = calculateLevel(totalXP);
  const rank = calculateRank(level);

  // Prepare skill data for radar charts
  const softSkillsData = SOFT_SKILLS.map(({ key, label }) => ({
    skill: label,
    score: calculateSkillScore(xpData[key]),
  }));

  const technicalSkillsData = TECHNICAL_SKILLS.map(({ key, label }) => ({
    skill: label,
    score: calculateSkillScore(xpData[key]),
  }));

  // Inform parent of any changes to XP if needed
  useEffect(() => {
    onChange("xp", xpData);
  }, [xpData, onChange]);

  return (
    <div className="profile-skills-container max-w-4xl mx-auto space-y-6">
      <LevelRankDisplay totalXP={totalXP} level={level} rank={rank} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <SkillRadarChart title="Soft Skills" data={softSkillsData} />
        <SkillRadarChart title="Technical Skills" data={technicalSkillsData} />
      </div>
    </div>
  );
}
