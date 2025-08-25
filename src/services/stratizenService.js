/* ------------------------------------------------------------------ */
/* Stratizen Service (posts, comments, reactions, etc.)               */
/* Centralizes logic for Stratizen page but reuses user helpers in db */
/* ------------------------------------------------------------------ */

import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
} from "firebase/firestore";
import { getUserProfile } from "./db"; // <-- reuse existing user logic

/* Helpers */
const ensurePostDefaults = (data = {}) => ({
  reactions: {
    like: [],
    love: [],
    haha: [],
    sad: [],
    angry: [],
    ...(data.reactions || {}),
  },
  reactionCounts: {
    like: data.reactionCounts?.like ?? 0,
    love: data.reactionCounts?.love ?? 0,
    haha: data.reactionCounts?.haha ?? 0,
    sad: data.reactionCounts?.sad ?? 0,
    angry: data.reactionCounts?.angry ?? 0,
  },
  commentsCount: data.commentsCount ?? 0,
});

/* =============================
   POSTS
============================= */

export async function createPost(
  userId,
  content,
  mediaOrUrl = null,
  tags = [],
  links = [],
  visibility = "public"
) {
  if (!userId) throw new Error("No userId provided");
  const hasText = Boolean(content?.trim());
  const hasMedia =
    (typeof mediaOrUrl === "string" && mediaOrUrl) ||
    (Array.isArray(mediaOrUrl) && mediaOrUrl.length > 0);

  if (!hasText && !hasMedia) {
    throw new Error("Post must have text or media");
  }

  let media = [];
  if (typeof mediaOrUrl === "string" && mediaOrUrl) {
    media = [{ url: mediaOrUrl, type: "image" }];
  } else if (Array.isArray(mediaOrUrl)) {
    media = mediaOrUrl;
  }

  const payload = {
    authorId: userId, // normalized storage
    content: content?.trim() || "",
    media,
    tags,
    links,
    visibility,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...ensurePostDefaults(),
  };

  const ref = await addDoc(collection(db, "posts"), payload);
  return ref.id;
}

export function listenToPosts(callback) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, async (snapshot) => {
    const posts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let author = null;

        if (data?.authorId) {
          author = await getUserProfile(data.authorId); // { id, username, photoURL }
        }

        return {
          id: docSnap.id,
          ...ensurePostDefaults(data),
          author,
        };
      })
    );
    callback(posts);
  });
}

export const listenToFeed = listenToPosts;

export async function updatePost(postId, updates) {
  if (!postId) throw new Error("No postId provided");
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deletePost(postId) {
  if (!postId) throw new Error("No postId provided");
  const ref = doc(db, "posts", postId);
  await deleteDoc(ref);
}

/* =============================
   REACTIONS (posts & comments)
============================= */

/**
 * Resolve Firestore doc reference for a post or a comment
 */
function getTargetRef(postId, commentId = null) {
  if (!postId) throw new Error("Missing postId");
  return commentId
    ? doc(db, "posts", postId, "comments", commentId)
    : doc(db, "posts", postId);
}

/**
 * Add or switch a reaction
 */
export async function addReaction(postId, userId, type = "like", commentId = null) {
  if (!userId) throw new Error("Missing userId");
  const targetRef = getTargetRef(postId, commentId);

  const snap = await getDoc(targetRef);
  const data = ensurePostDefaults(snap.data() || {}); // works for both posts & comments

  const userPreviousType =
    Object.keys(data.reactions).find((t) =>
      Array.isArray(data.reactions[t]) && data.reactions[t].includes(userId)
    ) || null;

  const updates = {};
  if (userPreviousType && userPreviousType !== type) {
    updates[`reactions.${userPreviousType}`] = arrayRemove(userId);
    updates[`reactionCounts.${userPreviousType}`] = increment(-1);
  }

  updates[`reactions.${type}`] = arrayUnion(userId);
  updates[`reactionCounts.${type}`] = increment(1);

  await updateDoc(targetRef, updates);
}

/**
 * Remove a reaction
 */
export async function removeReaction(postId, userId, type, commentId = null) {
  if (!userId || !type) throw new Error("Missing userId or type");
  const targetRef = getTargetRef(postId, commentId);

  await updateDoc(targetRef, {
    [`reactions.${type}`]: arrayRemove(userId),
    [`reactionCounts.${type}`]: increment(-1),
  });
}

/**
 * Listen to reactions on a post or a comment
 */
export function listenToReactions(postId, callback, commentId = null) {
  const targetRef = getTargetRef(postId, commentId);
  return onSnapshot(targetRef, (snap) => {
    const data = ensurePostDefaults(snap.data() || {});
    callback({
      users: data.reactions,
      counts: data.reactionCounts,
    });
  });
}

/* =============================
   COMMENTS
============================= */

export async function addComment(postId, userId, text) {
  if (!postId || !userId) throw new Error("Missing postId or userId");
  if (!text?.trim()) throw new Error("Empty comment");

  const postRef = doc(db, "posts", postId);
  const commentRef = doc(collection(db, "posts", postId, "comments"));

  const batch = writeBatch(db);
  batch.set(commentRef, {
    userId, // normalized storage
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  batch.update(postRef, { commentsCount: increment(1) });

  await batch.commit();
  return commentRef.id;
}

export async function deleteComment(postId, commentId) {
  if (!postId || !commentId) throw new Error("Missing postId or commentId");
  const postRef = doc(db, "posts", postId);
  const commentRef = doc(db, "posts", postId, "comments", commentId);

  const batch = writeBatch(db);
  batch.delete(commentRef);
  batch.update(postRef, { commentsCount: increment(-1) });

  await batch.commit();
}

export function listenToComments(postId, callback) {
  if (!postId) throw new Error("No postId provided");

  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, async (snapshot) => {
    const comments = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const author = data?.userId
          ? await getUserProfile(data.userId) // { id, username, photoURL }
          : null;
        return { id: docSnap.id, ...data, author };
      })
    );
    callback(comments);
  });
}
