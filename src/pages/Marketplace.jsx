// src/pages/Marketplace.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { createListing, listenToListings } from "../services/marketplaceService";
import Filters from "../components/Marketplace/Filters";
import ListingCard from "../components/Marketplace/ListingCard";
import ListingForm from "../components/Marketplace/ListingForm";
import SidePanel from "../components/Marketplace/SidePanel";
import "../styles/Marketplace.css";

// Import your ThemeContext hook
import { useTheme } from "../context/ThemeContext";

const auth = getAuth();

const Marketplace = () => {
  const { theme } = useTheme(); // ✅ get theme (light/dark)
  const darkMode = theme === "dark";

  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Listen to listings (real-time)
  useEffect(() => {
    const validCategory = typeof filterCategory === "string" ? filterCategory : "All";
    const unsubscribe = listenToListings(setListings, validCategory);
    return () => unsubscribe();
  }, [filterCategory]);

  // 🔹 Create a new listing
  const handleCreateListing = async (formData, resetForm) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please log in first.");

      const listingData = {
        ...formData,
        price: Number(parseFloat(formData.price).toFixed(2)),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
      };

      await createListing(listingData, formData.imageFile);

      setSuccess("✅ Listing created successfully!");
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error creating listing:", err);
      setError("❌ Error creating listing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Navigate to chat with seller
  const handleMessageSeller = (userId) => {
    if (auth.currentUser?.uid === userId) {
      setError("⚠️ You cannot message yourself.");
      return;
    }
    navigate(`/chat/${userId}`);
  };

  // 🔹 Filter & Search logic
  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        const matchesCategory =
          filterCategory === "All" || listing.category === filterCategory;
        const matchesSearch =
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [listings, searchTerm, filterCategory]
  );

  return (
    // ✅ Apply dark-mode class to wrapper dynamically
    <div className={`marketplace-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="marketplace-main">
        <div className="marketplace-container">
          <h2 className="marketplace-title">Students Marketplace Africa 🌍</h2>

          {success && <p className="alert success">{success}</p>}
          {error && <p className="alert error">{error}</p>}

          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            toggleForm={() => setShowForm((prev) => !prev)}
            showForm={showForm}
          />

          {showForm && (
            <ListingForm onSubmit={handleCreateListing} loading={loading} />
          )}

          <div className="listing-grid">
            {filteredListings.length === 0 ? (
              <p className="no-listings">
                No listings available. Start by creating your own!
              </p>
            ) : (
              filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  handleMessageSeller={handleMessageSeller}
                  defaultAvatar="/assets/default-avatar.png"
                />
              ))
            )}
          </div>
        </div>

        <SidePanel />
      </div>
    </div>
  );
};

export default Marketplace;
