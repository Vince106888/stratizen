import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Stream mentorship submissions (all, newest first)
 */
export function listenMentorshipSubmissions(db, onData, onError) {
  const q = query(collection(db, "mentorship"), orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(data);
    },
    onError
  );
}

/**
 * Search mentorship submissions by keyword
 * Matches any keyword in the `keywords` array of each document
 * @param {Firestore} db
 * @param {string} searchTerm
 * @returns {Promise<Array>}
 */
export async function searchMentorshipSubmissions(db, searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") return [];

  const term = searchTerm.trim().toLowerCase();
  const q = query(
    collection(db, "mentorship"),
    where("keywords", "array-contains", term),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Stream a user's connections (by participant membership)
 */
export function listenUserConnections(db, userId, onData, onError) {
  if (!userId) return () => {}; // No-op if no user
  const q = query(
    collection(db, "connections"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(data);
    },
    onError
  );
}

/**
 * Create a mentorship profile
 * Ensure keywords are generated for search
 */
export async function createMentorshipSubmission(db, payload) {
  const keywords = generateKeywords(payload);
  return addDoc(collection(db, "mentorship"), {
    ...payload,
    keywords,
    createdAt: serverTimestamp(),
  });
}

/**
 * Update a mentorship profile
 */
export async function updateMentorshipSubmission(db, id, payload) {
  const keywords = generateKeywords(payload);
  return updateDoc(doc(db, "mentorship", id), {
    ...payload,
    keywords,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a mentorship profile
 */
export async function deleteMentorshipSubmission(db, id) {
  return deleteDoc(doc(db, "mentorship", id));
}

/**
 * Request a connection between current user and target user
 */
export async function requestConnection(db, requesterId, targetUserId) {
  return addDoc(collection(db, "connections"), {
    requesterId,
    targetId: targetUserId,
    status: "pending",
    createdAt: serverTimestamp(),
    participants: [requesterId, targetUserId],
  });
}

/**
 * Helpers for connection lookups
 */
export function findConnection(connections = [], a, b) {
  return connections.find(
    (c) =>
      (c.requesterId === a && c.targetId === b) ||
      (c.requesterId === b && c.targetId === a)
  );
}

export function connectionExists(connections, a, b) {
  return Boolean(findConnection(connections, a, b));
}

export function getConnectionStatus(connections, a, b) {
  const c = findConnection(connections, a, b);
  return c?.status ?? null;
}

/**
 * Generate searchable keywords from mentorship profile payload
 */
function generateKeywords(payload) {
  let text = "";

  // Combine searchable fields (adjust as needed)
  if (payload.name) text += ` ${payload.name}`;
  if (payload.skills && Array.isArray(payload.skills))
    text += ` ${payload.skills.join(" ")}`;
  if (payload.bio) text += ` ${payload.bio}`;

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1);
}
