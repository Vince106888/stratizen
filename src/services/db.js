/* ------------------------------------------------------------------ */
/* src/services/db.js                                                  */
/* Implements unified per-user subcollection: users/{uid}/events       */
/* Exposes sync-friendly helpers (get, listen, add, update, delete)    */
/* ------------------------------------------------------------------ */

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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase"; // production Firestore

// -----------------------------
// User profile helpers
// -----------------------------
export const createUserProfile = async (user, extraData = {}) => {
  if (!user?.uid || !user?.email) throw new Error("Invalid user object");

  const userRef = doc(db, "users", user.uid);

  const profileData = {
    uid: user.uid,
    email: user.email,
    username: extraData.username || user.email.split("@")[0],
    fullName: extraData.fullName || user.displayName || "",
    phone: extraData.phone || "",
    year: extraData.year || "",
    school: extraData.school || "",
    group: extraData.group || "",
    bio: extraData.bio || "",
    interests: extraData.interests || "",
    residence: extraData.residence || "",
    profilePicture: extraData.profilePicture || "",

    // System / gamification defaults
    role: extraData.role || "student",
    xp: extraData.xp || 0,
    level: extraData.level || 1,
    reputation: extraData.reputation || 0,
    badges: extraData.badges || [],
    messagesCount: extraData.messagesCount || 0,
    forumPostsCount: extraData.forumPostsCount || 0,
    marketplaceItemsCount: extraData.marketplaceItemsCount || 0,

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
  await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
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
  return res.docs.map((d) => ({ uid: d.id, ...d.data() }));
};

// -----------------------------
// EVENTS LOGIC (user subcollections)
// -----------------------------

export async function addUserEvent(userId, eventData) {
  if (!userId) throw new Error("No userId provided");
  if (!eventData) throw new Error("No event data provided");

  const ref = await addDoc(collection(db, "users", userId, "events"), {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateUserEvent(userId, eventId, updates) {
  if (!userId || !eventId) throw new Error("userId and eventId required");
  const ref = doc(db, "users", userId, "events", eventId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteUserEvent(userId, eventId) {
  if (!userId || !eventId) throw new Error("userId and eventId required");
  const ref = doc(db, "users", userId, "events", eventId);
  await deleteDoc(ref);
}

export function listenToUserEvents(userId, callback) {
  if (!userId) throw new Error("No userId provided");

  const q = query(collection(db, "users", userId, "events"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(events);
  });

  return unsubscribe;
}

export async function getUserEventsOnce(userId) {
  if (!userId) throw new Error("No userId provided");

  const snapshot = await getDocs(query(collection(db, "users", userId, "events"), orderBy("createdAt", "desc")));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export { db };
