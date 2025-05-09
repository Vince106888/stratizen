import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, where } from "firebase/firestore";
import { app } from "../services/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../styles/Marketplace.css';  // Import the CSS for styling

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [filterCategory]);

  const fetchListings = async () => {
    try {
      const q = filterCategory === "All" ? query(collection(db, "marketplace"), orderBy("createdAt", "desc")) : query(collection(db, "marketplace"), where("category", "==", filterCategory), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const listingsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(listingsArray);
    } catch (err) {
      setError("Error fetching listings: " + err.message);
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.title || !newListing.description || !newListing.price) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in first.");
      return;
    }

    try {
      await addDoc(collection(db, "marketplace"), {
        title: newListing.title,
        description: newListing.description,
        price: newListing.price,
        category: newListing.category,
        createdAt: new Date(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
      });
      setSuccess("Listing created successfully!");
      setNewListing({ title: "", description: "", price: "", category: "General" });
      fetchListings();
    } catch (err) {
      setError("Error creating listing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-title">Marketplace</h2>

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
        <select
          value={filterCategory}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Books">Books</option>
          <option value="Electronics">Electronics</option>
          <option value="Services">Services</option>
        </select>
        <button
          onClick={() => setNewListing({ title: "", description: "", price: "", category: "General" })}
          className="create-btn"
        >
          Create New Listing
        </button>
      </div>

      {newListing && (
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
            placeholder="Price"
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
                  onClick={() => console.log("Message seller with ID:", listing.userId)}
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
