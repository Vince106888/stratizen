// src/services/marketplaceService.js
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { uploadMarketplaceImage } from "./storage"; // production Storage

const COLLECTION = "marketplace";

/**
 * Create a new marketplace listing.
 * @param {Object} listingData - { title, description, price, category, userId, userName }
 * @param {File} imageFile - optional image file
 * @returns {Promise<Object>} - Newly created listing with ID and imageUrl
 */
export const createListing = async (listingData, imageFile) => {
  if (!listingData || !listingData.userId) {
    throw new Error("Missing required listing data");
  }

  const itemId = `${listingData.userId}_${Date.now()}`;

  // Upload image to production Storage if provided
  let imageUrl = null;
  if (imageFile) {
    imageUrl = await uploadMarketplaceImage(itemId, imageFile, "thumbnail");
  }

  const newListing = {
    title: listingData.title,
    description: listingData.description,
    price: listingData.price,
    category: listingData.category,
    userId: listingData.userId,
    userName: listingData.userName || "Anonymous",
    imageUrl, // store only URL
    itemId,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), newListing);
  return { id: docRef.id, ...newListing };
};

/**
 * Fetch listings one-time
 * @param {string} category - Category filter, "All" for all categories
 */
export const fetchListings = async (category = "All") => {
  const listingsCollection = collection(db, COLLECTION);
  let q;

  if (category && category !== "All") {
    q = query(
      listingsCollection,
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(listingsCollection, orderBy("createdAt", "desc"));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Listen to listings in real-time
 * @param {function} callback - Receives array of listings on every update
 * @param {string} category - Optional category filter
 * @returns {function} unsubscribe function
 */
export const listenToListings = (callback, category = "All") => {
  const listingsCollection = collection(db, COLLECTION);
  let q;

  if (category && category !== "All") {
    q = query(
      listingsCollection,
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(listingsCollection, orderBy("createdAt", "desc"));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(listings);
  });

  return unsubscribe;
};

/**
 * Delete a listing by ID
 */
export const deleteListing = async (id) => {
  if (!id) throw new Error("Listing ID is required");
  await deleteDoc(doc(db, COLLECTION, id));
};

/**
 * Update a listing by ID
 */
export const updateListing = async (id, updates) => {
  if (!id) throw new Error("Listing ID is required");
  if (!updates || typeof updates !== "object") throw new Error("Updates object is required");
  await updateDoc(doc(db, COLLECTION, id), updates);
};
