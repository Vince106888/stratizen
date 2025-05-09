import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; // Custom CSS

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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const size = 100;
          canvas.width = size;
          canvas.height = size;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, 0, size, size);
          const preview = canvas.toDataURL("image/png");
          setForm((prev) => ({ ...prev, profilePicture: preview }));
        };
        img.src = reader.result;
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
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError("❌ Error saving profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Update Your Profile</h2>

      <div className="profile-avatar-section">
        <img
          src={form.profilePicture}
          alt="Profile Preview"
          className="profile-avatar"
        />
        <div>
          <label className="input-label">Upload Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="input-file" />
        </div>
      </div>

      <div className="form-grid">
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
        className={`submit-button ${loading ? "disabled" : ""}`}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>

      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

const FormInput = ({ id, label, value, onChange }) => (
  <div className="form-field">
    <label htmlFor={id} className="input-label">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      className="input-text"
    />
  </div>
);

const FormTextarea = ({ id, label, value, onChange }) => (
  <div className="form-textarea">
    <label htmlFor={id} className="input-label">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      rows={3}
      className="textarea-field"
    />
  </div>
);

const FormSelect = ({ id, label, value, onChange, options }) => (
  <div className="form-field">
    <label htmlFor={id} className="input-label">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="select-field"
    >
      <option value="">Select...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default Profile;
