import React from "react";
import '../styles/Careers.css';

const roles = [
  {
    title: "Frontend Developer",
    description: "Build engaging UIs with React and Tailwind.",
    tags: ["Remote", "Internship", "Part-time"],
    applyLink: "https://forms.gle/exampleform1"
  },
  {
    title: "Campus Ambassador",
    description: "Represent Stratizen at your university.",
    tags: ["Volunteer", "Leadership", "Community"],
    applyLink: "https://forms.gle/exampleform2"
  },
  {
    title: "Content Creator (STEM)",
    description: "Create and curate high-impact educational content.",
    tags: ["Remote", "Part-time"],
    applyLink: "https://forms.gle/exampleform3"
  },
];

export default function CareersPage() {
  return (
    <div className="careers-container">
      {/* Hero Section */}
      <section className="hero">
        <h1>Build the Future of Education. With Us.</h1>
        <p>
          Explore roles, internships, and collaborations that empower innovation and impact.
        </p>
        <div className="hero-buttons">
          <a href="#roles" className="cta primary">View Open Roles</a>
          <a href="/partner" className="cta outline">Partner With Us</a>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="value-grid">
        {[
            ["Mission-Driven", "Redefining peer-to-peer learning."],
          ["Global & Decentralized", "Open to anyone, anywhere."],
          ["Learn While You Work", "Mentorship and growth paths."],
          ["Innovate Freely", "Suggest features, lead initiatives."],
          ["Community First", "Impact lives, build your portfolio."],
        ].map(([title, desc], i) => (
          <div key={i} className="value-card">
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </section>

      {/* Open Opportunities */}
      <section id="roles" className="roles-section">
        <h2 className="text-center">Open Opportunities</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {roles.map((role, idx) => (
            <div key={idx} className="role-card">
              <h3 className="role-title">{role.title}</h3>
              <p>{role.description}</p>
              <div className="role-tags">
                {role.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
              <a href={role.applyLink} target="_blank" rel="noopener noreferrer" className="role-apply">
                Apply
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Internship & Ambassador Program */}
      <section className="internship-section">
        <h2>Internship & Ambassador Programs</h2>
        <p>
          Join our learning-by-doing programs and receive mentorship, experience, and impact.
        </p>
        <ul>
          <li>Real-world tasks and mentoring</li>
          <li>Campus leadership & community building</li>
          <li>Certificates, referral letters, and perks</li>
        </ul>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Don’t just study the future. Build it.</h2>
        <p>Your journey starts here. We’re excited to meet you.</p>
        <div>
          <a href="/apply" className="primary">Apply Now</a>
          <a href="/contact" className="outline">Contact Us</a>
        </div>
      </section>
    </div>
  );
}
