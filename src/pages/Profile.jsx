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
import { app } from "../services/firebase";
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
        return;
      }
      setUser(currentUser);
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm((prev) => ({ ...prev, ...docSnap.data() }));
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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
      setSuccess("✅ Profile saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        // Redirect after profile update
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError("❌ Error saving profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Update Your Profile</h2>

      <div className="flex items-center space-x-4 mb-6">
        <img
          src={form.profilePicture}
          alt="Profile Preview"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput id="fullName" label="Full Name *" value={form.fullName} onChange={handleChange} />
        <FormInput id="username" label="Username *" value={form.username} onChange={handleChange} />
        <FormInput id="school" label="School" value={form.school} onChange={handleChange} />
        <FormInput id="program" label="Program" value={form.program} onChange={handleChange} />
        <FormSelect id="year" label="Year" value={form.year} onChange={handleChange} options={["1", "2", "3", "4", "Postgraduate"]} />
        <FormSelect id="availability" label="Availability" value={form.availability} onChange={handleChange} options={["full-time", "part-time", "weekends", "not-available"]} />
        <FormInput id="linkedin" label="LinkedIn" value={form.linkedin} onChange={handleChange} />
        <FormInput id="github" label="GitHub" value={form.github} onChange={handleChange} />
        <FormInput id="website" label="Website" value={form.website} onChange={handleChange} />
        <FormInput id="interests" label="Interests" value={form.interests} onChange={handleChange} />
      </div>

      <FormTextarea id="bio" label="Bio" value={form.bio} onChange={handleChange} />
      <FormTextarea id="purpose" label="What problem are you solving? *" value={form.purpose} onChange={handleChange} />
      <FormTextarea id="skills" label="Skills" value={form.skills} onChange={handleChange} />
      <FormTextarea id="supportNeeds" label="What kind of help do you need?" value={form.supportNeeds} onChange={handleChange} />

      <button
        onClick={handleSubmit}
        className={`mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ${loading && "opacity-60 cursor-not-allowed"}`}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>

      {success && <p className="text-green-600 font-medium mt-4">{success}</p>}
      {error && <p className="text-red-600 font-medium mt-4">{error}</p>}
    </div>
  );
};

const FormInput = ({ id, label, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    />
  </div>
);

const FormTextarea = ({ id, label, value, onChange }) => (
  <div className="mt-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      rows={3}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    />
  </div>
);

const FormSelect = ({ id, label, value, onChange, options }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    >
      <option value="">Select...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default Profile;
