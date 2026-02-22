import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ValueGrid from "../components/Careers/ValueGrid";
import RoleList from "../components/Careers/RoleList";
import Programs from "../components/Careers/Programs";
import FinalCTA from "../components/Careers/FinalCTA";
import RightPanel from "../components/Careers/RightPanel";
import { useTheme } from "../context/ThemeContext";
import { getRoles } from "../services/CareersPage";
import "../styles/Careers.css";

export default function CareersPage() {
  const { darkMode } = useTheme();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔹 Active Section State
  const [activeSection, setActiveSection] = useState("roles");

  const fetchRoles = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getRoles();
      if (Array.isArray(data)) setRoles(data);
      else setError(true);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div
      className={`careers-wrapper min-h-screen transition-colors duration-300 ${
        darkMode
          ? "dark bg-gray-900 text-gray-100"
          : "bg-gradient-to-b from-gray-50 to-white text-gray-900"
      }`}
    >
      {/* 🔹 Integrated Hero Section */}
      <header className="py-12 text-center border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Careers Hub
        </h1>
        <p className="mt-3 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Build the future of education with us 🚀 — explore roles, programs,
          and collaborations that empower innovation and impact.
        </p>

        {/* 🔹 Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {[
            { key: "roles", label: "Open Roles" },
            { key: "programs", label: "Ambassador Programs" },
            { key: "values", label: "Our Values" },
            { key: "partner", label: "Partner With Us" },
            { key: "contact", label: "Contact Us" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveSection(btn.key)}
              className={`cta-btn ${
                activeSection === btn.key ? "primary" : "outline"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </header>

      {/* 🔹 Main + Side Panels */}
      <div className="careers-container max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === Main Panel (2/3) === */}
        <section className="main-panel-wrapper lg:col-span-2">
          <motion.main
            className="main-panel bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 space-y-10 transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading && (
              <p className="text-center text-lg animate-pulse">
                Loading roles...
              </p>
            )}

            {error && (
              <div className="text-center">
                <p className="text-red-500 font-medium">
                  ⚠️ Could not load career roles.
                </p>
                <button
                  onClick={fetchRoles}
                  className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 🔹 Section Switching */}
            {!loading && !error && activeSection === "roles" && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Open Roles
                </h2>
                <RoleList roles={roles} darkMode={darkMode} />
              </section>
            )}

            {activeSection === "programs" && <Programs darkMode={darkMode} />}
            {activeSection === "values" && <ValueGrid darkMode={darkMode} />}
            {activeSection === "partner" && (
              <FinalCTA darkMode={darkMode} title="Partner With Us" />
            )}
            {activeSection === "contact" && (
              <FinalCTA darkMode={darkMode} title="Contact Us" />
            )}
          </motion.main>
        </section>

        {/* === Right Panel (1/3 Sidebar) === */}
        <aside className="right-panel lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition">
              <RightPanel darkMode={darkMode} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
