import React from "react";
import '../../styles/Careers/FinalCTA.css';

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <h2>Don’t just study the future. Build it.</h2>
      <p>Your journey starts here. We’re excited to meet you.</p>
      <div className="cta-buttons">
        <a href="/apply" className="cta-btn primary">Apply Now</a>
        <a href="/contact" className="cta-btn outline">Contact Us</a>
      </div>
    </section>
  );
}
