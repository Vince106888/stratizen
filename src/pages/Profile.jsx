import React, { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "./firebaseConfig"; // Ensure Firebase is initialized in a separate file
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const db = getFirestore(app);
const auth = getAuth(app);

const Profile = () => {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    purpose: "",
    school: "",
    program: "",
    year: "",
    skills: "",
    linkedin: "",
    github: "",
    website: "",
    interests: "",
    availability: "",
    supportNeeds: "",
    profilePicture: "https://via.placeholder.com/100",
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/auth";
        return;
      }
      setUser(currentUser);
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm((prev) => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setSuccess("");
    setError("");

    const { fullName, username, purpose } = form;
    if (!fullName || !username || !purpose) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { ...form, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
        { merge: true }
      );
      setSuccess("Profile saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError("Error saving profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md p-8 mt-10 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>

      <img
        src={form.profilePicture}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover mb-4"
      />
      <label htmlFor="profilePicture">Upload Profile Picture</label>
      <input type="file" onChange={handleImageChange} className="mb-4" />

      <FormInput id="fullName" label="Full Name *" value={form.fullName} onChange={handleChange} />
      <FormInput id="username" label="Username *" value={form.username} onChange={handleChange} />
      <FormTextarea id="bio" label="Bio" value={form.bio} onChange={handleChange} />
      <FormTextarea id="purpose" label="What problem are you solving? *" value={form.purpose} onChange={handleChange} />
      <FormInput id="school" label="School" value={form.school} onChange={handleChange} />
      <FormInput id="program" label="Program" value={form.program} onChange={handleChange} />

      <div className="mb-4">
        <label htmlFor="year" className="font-semibold">Year</label>
        <select id="year" value={form.year} onChange={handleChange} className="w-full border px-4 py-2 rounded mt-2">
          <option value="">Select year</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>Postgraduate</option>
        </select>
      </div>

      <FormTextarea id="skills" label="Skills" value={form.skills} onChange={handleChange} />
      <FormInput id="interests" label="Interests" value={form.interests} onChange={handleChange} />
      <FormTextarea id="supportNeeds" label="What kind of help do you need?" value={form.supportNeeds} onChange={handleChange} />

      <div className="mb-4">
        <label htmlFor="availability" className="font-semibold">Availability for Collaboration</label>
        <select id="availability" value={form.availability} onChange={handleChange} className="w-full border px-4 py-2 rounded mt-2">
          <option value="">Select</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="weekends">Weekends</option>
          <option value="not-available">Not Available</option>
        </select>
      </div>

      <FormInput id="linkedin" label="LinkedIn" value={form.linkedin} onChange={handleChange} />
      <FormInput id="github" label="GitHub" value={form.github} onChange={handleChange} />
      <FormInput id="website" label="Website" value={form.website} onChange={handleChange} />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>

      {success && <p className="text-green-600 mt-4">{success}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

const FormInput = ({ id, label, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor={id} className="font-semibold">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      className="w-full border px-4 py-2 rounded mt-2"
    />
  </div>
);

const FormTextarea = ({ id, label, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor={id} className="font-semibold">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      className="w-full border px-4 py-2 rounded mt-2"
      rows={3}
    />
  </div>
);

export default Profile;
