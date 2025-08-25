import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // adjust path if different

// Fetch roles from Firestore
export const getRoles = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "roles"));
    const roles = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return null; // return null on failure
  }
};
