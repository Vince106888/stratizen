import React from "react";

export default function Hero() {
  return (
    <section className="hero bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-12 rounded-xl mb-8 relative overflow-hidden">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Build the Future of Education. With Us.</h1>
      <p className="text-lg md:text-xl mb-6">
        Explore roles, internships, and collaborations that empower innovation and impact.
      </p>
      <div className="flex gap-4 flex-wrap">
        <a href="#roles" className="cta primary bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          View Open Roles
        </a>
        <a href="/partner" className="cta outline border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition">
          Partner With Us
        </a>
      </div>
    </section>
  );
}
