import React, { useState, useRef } from "react";
import {
  validateImageFile,
  IMAGE_MAX_SIZE,
  VALID_IMAGE_TYPES,
} from "../../services/storage";

const ListingForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "General",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      setError(
        `Invalid file. Allowed: ${VALID_IMAGE_TYPES.join(
          ", "
        )}. Max size: ${IMAGE_MAX_SIZE / (1024 * 1024)}MB`
      );
      return;
    }

    setError("");
    setFormData((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.imageFile
    ) {
      setError("All fields are required.");
      return;
    }

    setError("");
    onSubmit(formData, () => {
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "General",
        imageFile: null,
      });
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  return (
    <form className="create-listing-form" onSubmit={handleSubmit}>
      <h3>Create New Listing</h3>

      {error && <p className="alert error">{error}</p>}

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        className="form-input"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="form-textarea"
        rows="4"
      />

      <input
        type="number"
        name="price"
        placeholder="Price (e.g., 10.00)"
        value={formData.price}
        onChange={handleChange}
        className="form-input"
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="form-select"
      >
        <option value="General">General</option>
        <option value="Books">Books</option>
        <option value="Electronics">Electronics</option>
        <option value="Services">Services</option>
      </select>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="form-input"
      />

      {imagePreview && (
        <img src={imagePreview} alt="Preview" className="image-preview" />
      )}

      <button
        type="submit"
        className="create-listing-btn"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
};

export default ListingForm;
