// src/services/mentorshipService.js

// Static dataset (fake mentorship submissions)
let mentorshipSubmissions = [
  {
    id: "1",
    name: "Alice Johnson",
    skills: ["JavaScript", "React", "Firebase"],
    bio: "Frontend developer passionate about UI/UX.",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Brian Kim",
    skills: ["Python", "Machine Learning"],
    bio: "AI enthusiast looking for collaborators.",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Clara Otieno",
    skills: ["Cybersecurity", "Networking"],
    bio: "Future SOC analyst, into threat hunting.",
    createdAt: new Date(),
  },
];

// ---------------------------
// Mentorship Submissions
// ---------------------------

export function listenMentorshipSubmissions(onData) {
  // Just return the static data
  onData([...mentorshipSubmissions].sort((a, b) => b.createdAt - a.createdAt));
  return () => {}; // mimic unsubscribe
}

export async function searchMentorshipSubmissions(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") return [];
  const term = searchTerm.trim().toLowerCase();

  return mentorshipSubmissions.filter(
    (m) =>
      m.name.toLowerCase().includes(term) ||
      m.bio.toLowerCase().includes(term) ||
      m.skills.some((s) => s.toLowerCase().includes(term))
  );
}

export async function createMentorshipSubmission(payload) {
  const newSubmission = {
    id: Date.now().toString(),
    ...payload,
    createdAt: new Date(),
  };
  mentorshipSubmissions.push(newSubmission);
  return newSubmission;
}

export async function updateMentorshipSubmission(id, payload) {
  mentorshipSubmissions = mentorshipSubmissions.map((m) =>
    m.id === id ? { ...m, ...payload, updatedAt: new Date() } : m
  );
  return true;
}

export async function deleteMentorshipSubmission(id) {
  mentorshipSubmissions = mentorshipSubmissions.filter((m) => m.id !== id);
  return true;
}
