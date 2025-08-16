import React from "react";
import Hero from "../components/Careers/Hero";
import ValueGrid from "../components/Careers/ValueGrid";
import RoleList from "../components/Careers/RoleList";
import Programs from "../components/Careers/Programs";
import FinalCTA from "../components/Careers/FinalCTA";
import RightPanel from "../components/Careers/RightPanel";
import '../styles/Careers.css'; // updated CSS

const roles = [
  { title: "Frontend Developer", description: "Build engaging UIs with React and Tailwind.", tags: ["Remote", "Internship", "Part-time"], applyLink: "https://forms.gle/exampleform1" },
  { title: "Campus Ambassador", description: "Represent Stratizen at your university.", tags: ["Volunteer", "Leadership", "Community"], applyLink: "https://forms.gle/exampleform2" },
  { title: "Content Creator (STEM)", description: "Create and curate high-impact educational content.", tags: ["Remote", "Part-time"], applyLink: "https://forms.gle/exampleform3" },
];

export default function CareersPage() {
  return (
    <div className="careers-wrapper">
      <div className="careers-container flex flex-col lg:flex-row gap-8 p-6 md:p-12">

        {/* Main Panel */}
        <main className="main-panel flex-1 space-y-12">
          <Hero />
          <ValueGrid />
          <RoleList roles={roles} />
          <Programs />
          <FinalCTA />
        </main>

        {/* Right Panel */}
        <aside className="right-panel w-full lg:w-1/3">
          <RightPanel />
        </aside>

      </div>
    </div>
  );
}
