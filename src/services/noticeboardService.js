// src/services/noticeboardService.js
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// ------------------
// Notices CRUD
// ------------------

/**
 * Fetch notices relevant to a user (one-time)
 */
export const fetchNotices = async (user) => {
  if (!user?.school) return [];

  try {
    const q = query(
      collection(db, "notices"),
      where("audience.schools", "array-contains", user.school),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching notices:", err);
    return [];
  }
};

/**
 * Listen to notices in real-time for a user
 * @returns unsubscribe function
 */
export const listenNotices = (user, callback) => {
  if (!user?.school) return () => {};

  const q = query(
    collection(db, "notices"),
    where("audience.schools", "array-contains", user.school),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (err) => console.error("Error listening to notices:", err)
  );
};

/**
 * Post a new notice
 */
export const postNotice = async (user, noticeData) => {
  if (!user?.uid) throw new Error("Invalid user");

  try {
    const docRef = await addDoc(collection(db, "notices"), {
      ...noticeData,
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      createdAt: serverTimestamp(),
      pinned: false,
    });
    return docRef.id;
  } catch (err) {
    console.error("Error posting notice:", err);
    throw err;
  }
};

// ------------------
// Suggestions CRUD
// ------------------

/**
 * Post a suggestion for a notice
 */
export const postSuggestion = async (user, suggestionData) => {
  if (!user?.uid) throw new Error("Invalid user");

  try {
    const docRef = await addDoc(collection(db, "notice_suggestions"), {
      ...suggestionData,
      submittedBy: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Error posting suggestion:", err);
    throw err;
  }
};
