import React from "react";

export default function FinalCTA() {
  return (
    <section className="final-cta p-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl text-center mt-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Don’t just study the future. Build it.</h2>
      <p className="mb-6">Your journey starts here. We’re excited to meet you.</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <a href="/apply" className="px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-gray-100 transition">Apply Now</a>
        <a href="/contact" className="px-6 py-3 rounded-lg border border-white hover:bg-white hover:text-blue-700 transition">Contact Us</a>
      </div>
    </section>
  );
}
