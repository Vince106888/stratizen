import React from "react";
import Hero from "../components/InnovationHub/Hero";
import FeaturedProjects from "../components/InnovationHub/FeaturedProjects";
import ProjectExplorer from "../components/InnovationHub/ProjectExplorer";
import SubmitInnovationForm from "../components/InnovationHub/SubmitInnovationForm";
import Mentors from "../components/InnovationHub/Mentors";
import Challenges from "../components/InnovationHub/Challenges";
import ResourceLibrary from "../components/InnovationHub/ResourceLibrary";
import "../styles/InnovationHub.css";

const InnovationHub = () => {
  return (
    <div className="innovation-hub-container font-sans bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8">
      <div className="innovation-hub-grid max-w-7xl mx-auto gap-6 lg:gap-8">
        {/* Main Left Panel */}
        <main className="innovation-main-panel space-y-12">
          <div className="panel">
            <Hero />
          </div>

          <div className="panel">
            <FeaturedProjects />
          </div>

          <div className="panel">
            <ProjectExplorer />
          </div>

          <div className="panel">
            <SubmitInnovationForm />
          </div>
        </main>

        {/* Right Side Panel (visible on lg screens) */}
        <aside className="innovation-right-panel hidden lg:flex flex-col gap-6">
          <div className="panel">
            <Mentors />
          </div>

          <div className="panel">
            <Challenges />
          </div>

          <div className="panel">
            <ResourceLibrary />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InnovationHub;
