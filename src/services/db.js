/* ------------------------------------------------------------------ */
/* src/services/db.js                                                  */
/* - Implements unified per-user subcollection: users/{uid}/events       */
/* - Exposes sync-friendly helpers (get, listen, add, update, delete)    */
/* ------------------------------------------------------------------ */

// File: src/services/db.js
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase"; // your initialized Firestore

// -----------------------------
// User profile helpers (unchanged)
// -----------------------------
export const createUserProfile = async (user, extraData = {}) => {
  if (!user?.uid || !user?.email) throw new Error("Invalid user object");
  const userRef = doc(db, "users", user.uid);
  const profileData = {
    uid: user.uid,
    email: user.email,
    username: extraData.username || user.email.split("@")[0],
    displayName: user.displayName || extraData.username || user.email.split("@")[0],
    role: "student",
    bio: "",
    profilePicture: "",
    coverPhoto: "",
    phone: "",
    gender: "",
    dob: "",
    location: "",
    school: "",
    course: "",
    yearOfStudy: "",
    interests: [],
    skills: [],
    xp: 0,
    level: 1,
    reputation: 0,
    badges: [],
    messagesCount: 0,
    forumPostsCount: 0,
    marketplaceItemsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extraData,
  };
  await setDoc(userRef, profileData);
  return profileData;
};

export const getUserProfile = async (userId) => {
  if (!userId) throw new Error("userId is required");
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (userId, updates) => {
  if (!userId) throw new Error("userId is required");
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteUserProfile = async (userId) => {
  if (!userId) throw new Error("userId is required");
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
};

export const getUsersByRole = async (role) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", role));
  const res = await getDocs(q);
  return res.docs.map(d => ({ uid: d.id, ...d.data() }));
};

/* ============================
   EVENTS LOGIC (USER SUBCOLLECTIONS)
============================ */
import { serverTimestamp } from "firebase/firestore";

/**
 * Add a new event to a user's subcollection: users/{uid}/events
 * @param {string} userId
 * @param {object} eventData
 * @returns {Promise<string>} The created document ID
 */
export async function addUserEvent(userId, eventData) {
  if (!userId) throw new Error("No userId provided");
  if (!eventData) throw new Error("No event data provided");

  try {
    const ref = await addDoc(collection(db, "users", userId, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error("Error adding user event:", err);
    throw err;
  }
}

/**
 * Update an existing event in a user's subcollection
 * @param {string} userId
 * @param {string} eventId
 * @param {object} updates
 */
export async function updateUserEvent(userId, eventId, updates) {
  if (!userId) throw new Error("No userId provided");
  if (!eventId) throw new Error("No eventId provided");

  try {
    const ref = doc(db, "users", userId, "events", eventId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("Error updating user event:", err);
    throw err;
  }
}

/**
 * Delete an event from a user's subcollection
 * @param {string} userId
 * @param {string} eventId
 */
export async function deleteUserEvent(userId, eventId) {
  if (!userId) throw new Error("No userId provided");
  if (!eventId) throw new Error("No eventId provided");

  try {
    const ref = doc(db, "users", userId, "events", eventId);
    await deleteDoc(ref);
  } catch (err) {
    console.error("Error deleting user event:", err);
    throw err;
  }
}

/**
 * Listen in real-time for all events belonging to a user
 * @param {string} userId
 * @param {(events: object[]) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToUserEvents(userId, callback) {
  if (!userId) throw new Error("No userId provided");

  const q = query(
    collection(db, "users", userId, "events"),
    orderBy("createdAt", "desc") // newest first
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(events);
  });

  return unsubscribe;
}

/**
 * Fetch all events for a user once
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getUserEventsOnce(userId) {
  if (!userId) throw new Error("No userId provided");

  try {
    const snapshot = await getDocs(
      query(collection(db, "users", userId, "events"), orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching user events:", err);
    throw err;
  }
}

export { db };