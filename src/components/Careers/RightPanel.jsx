import React from "react";
import '../../styles/Careers/RightPanel.css';

export default function RightPanel() {
  return (
    <div className="flex flex-col space-y-6 sticky top-24">

      {/* Quick Links */}
      <div className="panel quick-links">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#roles">Open Roles</a></li>
          <li><a href="/partner">Partner With Us</a></li>
          <li><a href="/apply">Apply Now</a></li>
        </ul>
      </div>

      {/* Stats & Highlights */}
      <div className="panel highlights">
        <h3>Highlights</h3>
        <ul>
          <li>✅ 200+ applicants last month</li>
          <li>✅ 10 active programs</li>
          <li>✅ Remote & Global Opportunities</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="panel cta-panel">
        <h4>Join Our Team</h4>
        <a href="/apply" className="apply-btn">Apply Now</a>
      </div>

    </div>
  );
}
