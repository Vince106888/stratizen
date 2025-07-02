import React, { useState, useEffect } from "react";

const InnovationHub = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto font-sans space-y-16">

      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🚀 Innovation Hub: Where Ideas Take Flight</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Showcase your creativity, collaborate with peers, and bring your ideas to life through our innovation ecosystem.</p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Submit Your Idea</button>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Explore Projects</button>
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🌟 Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["AI Study Assistant", "Green Campus App", "PeerLearn Platform"].map((title, i) => (
            <div key={i} className="bg-white shadow-md border p-4 rounded-xl">
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-gray-600 mb-2">Brief description about the project goes here.</p>
              <div className="flex flex-wrap gap-2 mb-1">
                {['AI', 'Education', 'Web'].map((tag, j) => (
                  <span key={j} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <span className="text-xs text-gray-500">Status: Prototype</span>
            </div>
          ))}
        </div>
      </section>

      {/* Project Explorer */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🔍 Project Library</h2>
        <div className="mb-4 flex flex-wrap gap-4">
          <select className="border rounded-md px-3 py-1">
            <option>All Categories</option>
            <option>AI</option>
            <option>Health</option>
            <option>Finance</option>
          </select>
          <select className="border rounded-md px-3 py-1">
            <option>All Levels</option>
            <option>Idea</option>
            <option>Prototype</option>
            <option>MVP</option>
          </select>
          <select className="border rounded-md px-3 py-1">
            <option>Sort by</option>
            <option>Most Upvoted</option>
            <option>Newest</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white p-4 shadow rounded-xl">
              <h3 className="font-bold">Project {i}</h3>
              <p className="text-sm">Description of the project goes here...</p>
              <p className="text-xs mt-1 text-gray-500">Owner: Student {i} | Status: Idea</p>
            </div>
          ))}
        </div>
      </section>

      {/* Submit Your Innovation */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">📤 Submit Your Innovation</h2>
        <form className="space-y-4 bg-gray-50 p-6 rounded-xl border">
          <input type="text" placeholder="Project Title" className="w-full border px-4 py-2 rounded-md" />
          <textarea placeholder="Short Description" className="w-full border px-4 py-2 rounded-md" />
          <input type="text" placeholder="Category" className="w-full border px-4 py-2 rounded-md" />
          <input type="text" placeholder="Tags (comma-separated)" className="w-full border px-4 py-2 rounded-md" />
          <input type="url" placeholder="GitHub / Figma / Drive Link" className="w-full border px-4 py-2 rounded-md" />
          <input type="file" className="w-full border px-4 py-2 rounded-md" />
          <input type="text" placeholder="Team Members" className="w-full border px-4 py-2 rounded-md" />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Submit</button>
        </form>
      </section>

      {/* Mentors & Collaborators */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🤝 Mentors & Collaborators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3].map((id) => (
            <div key={id} className="border p-4 rounded-xl bg-white shadow-sm">
              <h3 className="font-bold">Mentor {id}</h3>
              <p className="text-sm text-gray-600">Looking for: Frontend Dev, UX Design</p>
              <button className="mt-2 text-blue-600 text-sm underline">Message</button>
            </div>
          ))}
        </div>
      </section>

      {/* Innovation Challenges */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🏆 Innovation Challenges</h2>
        <ul className="space-y-4">
          {[1,2].map((challenge) => (
            <li key={challenge} className="p-4 border rounded-lg bg-white">
              <h3 className="font-bold">Hackathon {challenge}</h3>
              <p className="text-sm text-gray-600">Deadline: July 10 | Team Size: Up to 4 | Prize: $500</p>
              <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded-md">Register</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Resource Library */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">📚 Resource Library</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><a href="#" className="text-blue-600 underline">Prototyping Tools</a></li>
          <li><a href="#" className="text-blue-600 underline">Startup Legal Guide (PDF)</a></li>
          <li><a href="#" className="text-blue-600 underline">Pitching 101 (Video)</a></li>
        </ul>
      </section>

    </div>
  );
};

export default InnovationHub;
