// src/hooks/useUser.js
import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUser({ uid: snap.id, ...snap.data() });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
