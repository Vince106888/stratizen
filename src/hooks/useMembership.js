// src/hooks/useMembership.js
import { useState } from "react";
import {
  getFirestore,
  doc,
  writeBatch,
  runTransaction,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export function useMembership(entityType) {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function join(entityId) {
    if (!user) throw new Error("User must be logged in");

    setLoading(true);
    setError(null);

    try {
      const batch = writeBatch(db);

      const memberRef = doc(db, entityType, entityId, "members", user.uid);
      batch.set(memberRef, { joinedAt: new Date() });

      const userRef = doc(db, "users", user.uid);
      batch.update(userRef, { [entityType]: arrayUnion(entityId) });

      if (entityType === "clubs") {
        await runTransaction(db, async (transaction) => {
          const entityRef = doc(db, entityType, entityId);
          const entityDoc = await transaction.get(entityRef);
          if (!entityDoc.exists()) throw "Entity does not exist!";
          const newCount = (entityDoc.data().memberCount || 0) + 1;
          transaction.update(entityRef, { memberCount: newCount });
        });
      }

      await batch.commit();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e.message);
      throw e;
    }
  }

  async function leave(entityId) {
    if (!user) throw new Error("User must be logged in");

    setLoading(true);
    setError(null);

    try {
      const batch = writeBatch(db);

      const memberRef = doc(db, entityType, entityId, "members", user.uid);
      batch.delete(memberRef);

      const userRef = doc(db, "users", user.uid);
      batch.update(userRef, { [entityType]: arrayRemove(entityId) });

      if (entityType === "clubs") {
        await runTransaction(db, async (transaction) => {
          const entityRef = doc(db, entityType, entityId);
          const entityDoc = await transaction.get(entityRef);
          if (!entityDoc.exists()) throw "Entity does not exist!";
          const newCount = Math.max((entityDoc.data().memberCount || 1) - 1, 0);
          transaction.update(entityRef, { memberCount: newCount });
        });
      }

      await batch.commit();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e.message);
      throw e;
    }
  }

  return { join, leave, loading, error };
}
