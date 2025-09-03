// src/services/resourceService.js
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// ------------------------
// Resources
// ------------------------

/**
 * Fetch all resources (one-time)
 */
export const fetchResources = async () => {
  try {
    const resSnap = await getDocs(collection(db, "resources"));
    return resSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching resources:", err);
    return [];
  }
};

/**
 * Listen to resources in real-time
 * @param {function} callback
 * @returns unsubscribe function
 */
export const listenResources = (callback) => {
  const q = query(collection(db, "resources"));
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (err) => console.error("Error listening to resources:", err)
  );
};

/**
 * Add a new resource
 */
export const addResource = async (resource) => {
  if (!resource) throw new Error("Resource data is required");
  try {
    const docRef = await addDoc(collection(db, "resources"), resource);
    return { id: docRef.id, ...resource };
  } catch (err) {
    console.error("Error adding resource:", err);
    throw err;
  }
};

/**
 * Fetch resources filtered by schoolId and/or subjectId
 */
export const fetchFilteredResources = async (schoolId, subjectId) => {
  try {
    let q = collection(db, "resources");
    const conditions = [];
    if (schoolId) conditions.push(where("schoolId", "==", schoolId));
    if (subjectId) conditions.push(where("subjectId", "==", subjectId));
    if (conditions.length) q = query(q, ...conditions);

    const resSnap = await getDocs(q);
    return resSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching filtered resources:", err);
    return [];
  }
};

// ------------------------
// Schools & Subjects
// ------------------------

export const fetchSchools = async () => {
  try {
    const snap = await getDocs(collection(db, "schools"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching schools:", err);
    return [];
  }
};

export const fetchSubjects = async () => {
  try {
    const snap = await getDocs(collection(db, "subjects"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
};
