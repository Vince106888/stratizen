import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // production Firestore

/**
 * Fetch all roles from Firestore
 * @returns {Promise<Array<{id: string, name: string}>> | null}
 */
export const getRoles = async () => {
  try {
    const rolesRef = collection(db, "roles");
    const snapshot = await getDocs(rolesRef);
    const roles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return null;
  }
};
