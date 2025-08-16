import React from "react";

const values = [
  ["Mission-Driven", "Redefining peer-to-peer learning."],
  ["Global & Decentralized", "Open to anyone, anywhere."],
  ["Learn While You Work", "Mentorship and growth paths."],
  ["Innovate Freely", "Suggest features, lead initiatives."],
  ["Community First", "Impact lives, build your portfolio."]
];

export default function ValueGrid() {
  return (
    <section className="value-grid grid md:grid-cols-3 gap-6 mb-8">
      {values.map(([title, desc], i) => (
        <div key={i} className="value-card p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">{title}</h3>
          <p className="text-gray-700 dark:text-gray-300">{desc}</p>
        </div>
      ))}
    </section>
  );
}
