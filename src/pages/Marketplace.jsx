import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { app } from "../services/firebase";
import {
  uploadMarketplaceImage,
  validateImageFile,
  IMAGE_MAX_SIZE,
  VALID_IMAGE_TYPES,
} from "../services/storage";
import "../styles/Marketplace.css";

const db = getFirestore(app);
const auth = getAuth(app);

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    category: "General",
    imageFile: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [imagePreview, setImagePreview] = useState("");

  const navigate = useNavigate();

  // Real-time listener
  useEffect(() => {
    const q =
      filterCategory === "All"
        ? query(collection(db, "marketplace"), orderBy("createdAt", "desc"))
        : query(
            collection(db, "marketplace"),
            where("category", "==", filterCategory),
            orderBy("createdAt", "desc")
          );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [filterCategory]);

  // Auto-hide alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing((prev) => ({ ...prev, [name]: value }));
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

    setNewListing((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreateListing = async () => {
    if (
      !newListing.title.trim() ||
      !newListing.description.trim() ||
      !newListing.price
    ) {
      setError("All fields are required.");
      return;
    }
    if (isNaN(newListing.price) || parseFloat(newListing.price) <= 0) {
      setError("Enter a valid positive price.");
      return;
    }
    if (!newListing.imageFile) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    try {
      // Generate a unique ID for this listing (used for Firestore & Storage)
      const listingId = `${user.uid}_${Date.now()}`;

      // Upload image via shared storage.js function
      const imageUrl = await uploadMarketplaceImage(
        listingId,
        newListing.imageFile
      );

      // Save listing
      await addDoc(collection(db, "marketplace"), {
        id: listingId,
        title: newListing.title,
        description: newListing.description,
        price: parseFloat(newListing.price).toFixed(2),
        category: newListing.category,
        createdAt: Timestamp.now(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        imageUrl,
      });

      setSuccess("Listing created successfully!");
      setNewListing({
        title: "",
        description: "",
        price: "",
        category: "General",
        imageFile: null,
      });
      setImagePreview("");
      setShowForm(false);
    } catch (err) {
      setError("Error creating listing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSeller = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="marketplace-main">
      <div className="marketplace-container">
        <h2 className="marketplace-title">Student Marketplace</h2>

        {success && <p className="alert success">{success}</p>}
        {error && <p className="alert error">{error}</p>}

        {/* Filters */}
        <div className="filter-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.trimStart())}
            placeholder="Search listings..."
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Services">Services</option>
          </select>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="create-btn"
          >
            {showForm ? "Cancel" : "Create New Listing"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="create-listing-form">
            <h3>Create New Listing</h3>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newListing.title}
              onChange={handleInputChange}
              className="form-input"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newListing.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="4"
            />
            <input
              type="number"
              name="price"
              placeholder="Price (e.g., 10.00)"
              value={newListing.price}
              onChange={handleInputChange}
              className="form-input"
            />
            <select
              name="category"
              value={newListing.category}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="General">General</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Services">Services</option>
            </select>

            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}

            <button
              onClick={handleCreateListing}
              className="create-listing-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Listing"}
            </button>
          </div>
        )}

        {/* Listings */}
        <div className="listing-grid">
          {listings.length === 0 ? (
            <p>No listings available. Start by creating your own!</p>
          ) : (
            listings
              .filter(
                (listing) =>
                  listing.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  listing.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((listing) => (
                <div key={listing.id} className="listing-card">
                  {listing.imageUrl && (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="listing-image"
                    />
                  )}
                  <h4>{listing.title}</h4>
                  <p title={listing.description}>
                    {listing.description.length > 80
                      ? listing.description.slice(0, 80) + "..."
                      : listing.description}
                  </p>
                  <p className="price">${listing.price}</p>
                  <p className="category">Category: {listing.category}</p>
                  <p className="seller">Posted by: {listing.userName}</p>
                  <p className="time">
                    {listing.createdAt?.seconds
                      ? formatDistanceToNow(
                          new Date(listing.createdAt.seconds * 1000),
                          { addSuffix: true }
                        )
                      : ""}
                  </p>
                  <button
                    onClick={() => handleMessageSeller(listing.userId)}
                    className="message-btn"
                  >
                    Message Seller
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className="marketplace-side-panel">
        <h3>Featured</h3>
        <p>🚀 Special deals for students!</p>
        <ul>
          <li>📚 Discounted books</li>
          <li>💻 Affordable electronics</li>
          <li>🎓 Student services</li>
        </ul>
      </div>
    </div>
  );
};

export default Marketplace;
