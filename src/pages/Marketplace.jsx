import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, where } from "firebase/firestore";
import { app } from "../services/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
  }, []);

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
    fetchListings();
  };

  const handleMessageSeller = (sellerId) => {
    // Future messaging feature: navigate to a message thread with the seller
    console.log("Message seller with ID: ", sellerId);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 mt-10 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Marketplace</h2>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search listings..."
            className="p-2 border rounded"
          />
          <select
            value={filterCategory}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Services">Services</option>
          </select>
        </div>
        <button
          onClick={() => setNewListing({ title: "", description: "", price: "", category: "General" })}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
        >
          Create New Listing
        </button>
      </div>

      {newListing && (
        <div className="mb-6 p-6 border rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Create New Listing</h3>
          <input
            type="text"
            placeholder="Title"
            value={newListing.title}
            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
            className="w-full p-2 border mt-2 rounded"
          />
          <textarea
            placeholder="Description"
            value={newListing.description}
            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
            className="w-full p-2 border mt-2 rounded"
            rows="4"
          />
          <input
            type="number"
            placeholder="Price"
            value={newListing.price}
            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
            className="w-full p-2 border mt-2 rounded"
          />
          <select
            value={newListing.category}
            onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
            className="w-full p-2 border mt-2 rounded"
          >
            <option value="General">General</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Services">Services</option>
          </select>
          <button
            onClick={handleCreateListing}
            className="bg-green-600 text-white px-6 py-2 mt-4 rounded hover:bg-green-800 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {listings.length === 0 ? (
          <p>No listings available. Start by creating your own!</p>
        ) : (
          listings
            .filter((listing) =>
              listing.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((listing) => (
              <div key={listing.id} className="p-4 border rounded-lg shadow-md">
                <h4 className="text-xl font-semibold">{listing.title}</h4>
                <p>{listing.description}</p>
                <p className="text-green-600 font-semibold">${listing.price}</p>
                <p className="text-sm text-gray-500">Category: {listing.category}</p>
                <p className="text-sm text-gray-500">Posted by: {listing.userName}</p>
                <button
                  onClick={() => handleMessageSeller(listing.userId)}
                  className="bg-blue-600 text-white px-6 py-2 mt-4 rounded hover:bg-blue-800 transition"
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
