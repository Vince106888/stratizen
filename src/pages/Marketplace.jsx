import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { app } from "../services/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
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
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [filterCategory]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchListings = async () => {
    try {
      const q =
        filterCategory === "All"
          ? query(collection(db, "marketplace"), orderBy("createdAt", "desc"))
          : query(
              collection(db, "marketplace"),
              where("category", "==", filterCategory),
              orderBy("createdAt", "desc")
            );
      const querySnapshot = await getDocs(q);
      const listingsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(listingsArray);
    } catch (err) {
      setError("Error fetching listings: " + err.message);
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.title.trim() || !newListing.description.trim() || !newListing.price) {
      setError("All fields are required.");
      return;
    }

    if (isNaN(newListing.price) || parseFloat(newListing.price) <= 0) {
      setError("Enter a valid positive price.");
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
      await addDoc(collection(db, "marketplace"), {
        ...newListing,
        price: parseFloat(newListing.price).toFixed(2),
        createdAt: Timestamp.now(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
      });

      setSuccess("Listing created successfully!");
      setNewListing({ title: "", description: "", price: "", category: "General" });
      fetchListings();
      setShowForm(false);
    } catch (err) {
      setError("Error creating listing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.trimStart());
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
    setError("");
    setSuccess("");
  };

  const handleMessageSeller = (userId) => {
    console.log("Initiate message to:", userId);
    // Future: Navigate to chat or open message modal
    // navigate(`/messages/${userId}`);
  };

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-title">Student Marketplace</h2>

      {success && <p className="alert success">{success}</p>}
      {error && <p className="alert error">{error}</p>}

      <div className="filter-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search listings..."
          className="search-input"
        />
        <select value={filterCategory} onChange={handleFilterChange} className="filter-select">
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Books">Books</option>
          <option value="Electronics">Electronics</option>
          <option value="Services">Services</option>
        </select>
        <button onClick={handleToggleForm} className="create-btn">
          {showForm ? "Cancel" : "Create New Listing"}
        </button>
      </div>

      {showForm && (
        <div className="create-listing-form">
          <h3>Create New Listing</h3>
          <input
            type="text"
            placeholder="Title"
            value={newListing.title}
            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
            className="form-input"
          />
          <textarea
            placeholder="Description"
            value={newListing.description}
            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
            className="form-textarea"
            rows="4"
          />
          <input
            type="number"
            placeholder="Price (e.g., 10.00)"
            value={newListing.price}
            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
            className="form-input"
          />
          <select
            value={newListing.category}
            onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
            className="form-select"
          >
            <option value="General">General</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Services">Services</option>
          </select>
          <button
            onClick={handleCreateListing}
            className="create-listing-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </div>
      )}

      <div className="listing-container">
        {listings.length === 0 ? (
          <p>No listings available. Start by creating your own!</p>
        ) : (
          listings
            .filter((listing) =>
              listing.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((listing) => (
              <div key={listing.id} className="listing-card">
                <h4>{listing.title}</h4>
                <p>{listing.description}</p>
                <p className="price">${listing.price}</p>
                <p className="category">Category: {listing.category}</p>
                <p className="seller">Posted by: {listing.userName}</p>
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
  );
};

export default Marketplace;
