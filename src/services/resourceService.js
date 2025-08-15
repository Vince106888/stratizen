import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

// Fetch all resources
export const fetchResources = async () => {
  const resSnap = await getDocs(collection(db, "resources"));
  return resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch all schools
export const fetchSchools = async () => {
  const schoolSnap = await getDocs(collection(db, "schools"));
  return schoolSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch all subjects
export const fetchSubjects = async () => {
  const subjSnap = await getDocs(collection(db, "subjects"));
  return subjSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a new resource
export const addResource = async (resource) => {
  const docRef = await addDoc(collection(db, "resources"), resource);
  return { id: docRef.id, ...resource };
};

// Optional: fetch resources by school/subject
export const fetchFilteredResources = async (schoolId, subjectId) => {
  let q = collection(db, "resources");
  if (schoolId || subjectId) {
    const conditions = [];
    if (schoolId) conditions.push(where("schoolId", "==", schoolId));
    if (subjectId) conditions.push(where("subjectId", "==", subjectId));
    q = query(q, ...conditions);
  }
  const resSnap = await getDocs(q);
  return resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
