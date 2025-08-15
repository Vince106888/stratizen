import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

// ------------------
// Notices CRUD
// ------------------
export const fetchNotices = async (user) => {
  // Query notices relevant to user audience
  const q = query(
    collection(db, "notices"),
    where("audience.schools", "array-contains", user.school),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const listenNotices = (user, callback) => {
  const q = query(
    collection(db, "notices"),
    where("audience.schools", "array-contains", user.school),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const postNotice = async (user, noticeData) => {
  const docRef = await addDoc(collection(db, "notices"), {
    ...noticeData,
    authorId: user.uid,
    authorName: user.displayName,
    createdAt: serverTimestamp(),
    pinned: false
  });
  return docRef.id;
};

// ------------------
// Suggestions CRUD
// ------------------
export const postSuggestion = async (user, suggestionData) => {
  const docRef = await addDoc(collection(db, "notice_suggestions"), {
    ...suggestionData,
    submittedBy: user.uid,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};
