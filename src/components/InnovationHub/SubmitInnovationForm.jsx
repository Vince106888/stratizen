import React, { useState } from "react";
import "../../styles/Innovation/SubmitInnovationForm.css";

const SubmitInnovationForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    link: "",
    file: null,
    team: ""
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log("Submitted Innovation:", formData);
    alert("Innovation submitted successfully!");
    setFormData({
      title: "",
      description: "",
      category: "",
      tags: "",
      link: "",
      file: null,
      team: ""
    });
  };

  return (
    <section className="submit-innovation panel">
      <h2>📤 Submit Your Innovation</h2>
      <form className="innovation-form" onSubmit={handleSubmit}>
        <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="Project Title" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short Description" />
        <input name="category" value={formData.category} onChange={handleChange} type="text" placeholder="Category" />
        <input name="tags" value={formData.tags} onChange={handleChange} type="text" placeholder="Tags (comma-separated)" />
        <input name="link" value={formData.link} onChange={handleChange} type="url" placeholder="GitHub / Figma / Drive Link" />
        <input name="file" onChange={handleChange} type="file" />
        <input name="team" value={formData.team} onChange={handleChange} type="text" placeholder="Team Members" />
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </section>
  );
};

export default SubmitInnovationForm;
