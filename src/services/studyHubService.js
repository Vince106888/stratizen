// src/services/studyHubService.js
import { db } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
} from 'firebase/firestore';

/* ==============================
   QUESTIONS
============================== */

/**
 * Subscribe to questions (real-time)
 */
export function subscribeToQuestions(cb) {
  const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const arr = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        answers: d.data().answers || [],
        tags: d.data().tags || [],
      }));
      cb(arr);
    },
    (err) => console.error('subscribeToQuestions error:', err)
  );
}

/**
 * Add a new question
 */
export async function addQuestion({ title, content, tags = [], author = null }) {
  const payload = {
    title,
    content,
    tags,
    author,
    createdAt: serverTimestamp(),
    likes: 0,
    dislikes: 0,
    likedBy: {},
    dislikedBy: {},
    reports: 0,
    reportedBy: {},
    answers: [],
  };
  const ref = await addDoc(collection(db, 'questions'), payload);
  return ref.id;
}

/* ==============================
   ANSWERS
============================== */

/**
 * Add an answer to a question
 */
export async function addAnswer(questionId, { content, author = null }) {
  const qRef = doc(db, 'questions', questionId);
  const answerId = crypto.randomUUID();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(qRef);
    if (!snap.exists()) throw new Error('Question not found');

    const data = snap.data();
    const answers = data.answers || [];

    const newAnswer = {
      id: answerId,
      content,
      author,
      createdAt: serverTimestamp(),
      likes: 0,
      dislikes: 0,
      likedBy: {},
      dislikedBy: {},
      reports: 0,
      reportedBy: {},
    };

    answers.push(newAnswer);
    tx.update(qRef, { answers });
  });

  return answerId;
}

/* ==============================
   REACTIONS & REPORTS
============================== */

/**
 * React to a question (like/dislike)
 */
export async function reactToQuestion(questionId, uid, type) {
  const qRef = doc(db, 'questions', questionId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(qRef);
    if (!snap.exists()) throw new Error('Question not found');

    const data = snap.data();
    const likedBy = data.likedBy || {};
    const dislikedBy = data.dislikedBy || {};
    let likes = data.likes || 0;
    let dislikes = data.dislikes || 0;

    const hasLiked = !!likedBy[uid];
    const hasDisliked = !!dislikedBy[uid];

    if (type === 'like') {
      if (hasLiked) {
        delete likedBy[uid];
        likes--;
      } else {
        likedBy[uid] = true;
        likes++;
        if (hasDisliked) {
          delete dislikedBy[uid];
          dislikes--;
        }
      }
    }

    if (type === 'dislike') {
      if (hasDisliked) {
        delete dislikedBy[uid];
        dislikes--;
      } else {
        dislikedBy[uid] = true;
        dislikes++;
        if (hasLiked) {
          delete likedBy[uid];
          likes--;
        }
      }
    }

    tx.update(qRef, { likes, dislikes, likedBy, dislikedBy });
  });
}

/**
 * Report a question
 */
export async function reportQuestion(questionId, uid) {
  const qRef = doc(db, 'questions', questionId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(qRef);
    if (!snap.exists()) throw new Error('Question not found');

    const data = snap.data();
    const reportedBy = data.reportedBy || {};
    let reports = data.reports || 0;

    if (!reportedBy[uid]) {
      reportedBy[uid] = true;
      reports++;
    }

    tx.update(qRef, { reports, reportedBy });
  });
}

/**
 * React to an answer (like/dislike)
 */
export async function reactToAnswer(questionId, answerId, uid, type) {
  const qRef = doc(db, 'questions', questionId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(qRef);
    if (!snap.exists()) throw new Error('Question not found');

    const data = snap.data();
    const answers = data.answers || [];
    const idx = answers.findIndex((a) => a.id === answerId);
    if (idx === -1) throw new Error('Answer not found');

    const answer = answers[idx];
    answer.likedBy = answer.likedBy || {};
    answer.dislikedBy = answer.dislikedBy || {};
    answer.likes = answer.likes || 0;
    answer.dislikes = answer.dislikes || 0;

    const hasLiked = !!answer.likedBy[uid];
    const hasDisliked = !!answer.dislikedBy[uid];

    if (type === 'like') {
      if (hasLiked) {
        delete answer.likedBy[uid];
        answer.likes--;
      } else {
        answer.likedBy[uid] = true;
        answer.likes++;
        if (hasDisliked) {
          delete answer.dislikedBy[uid];
          answer.dislikes--;
        }
      }
    }

    if (type === 'dislike') {
      if (hasDisliked) {
        delete answer.dislikedBy[uid];
        answer.dislikes--;
      } else {
        answer.dislikedBy[uid] = true;
        answer.dislikes++;
        if (hasLiked) {
          delete answer.likedBy[uid];
          answer.likes--;
        }
      }
    }

    answers[idx] = answer;
    tx.update(qRef, { answers });
  });
}

/**
 * Report an answer
 */
export async function reportAnswer(questionId, answerId, uid) {
  const qRef = doc(db, 'questions', questionId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(qRef);
    if (!snap.exists()) throw new Error('Question not found');

    const data = snap.data();
    const answers = data.answers || [];
    const idx = answers.findIndex((a) => a.id === answerId);
    if (idx === -1) throw new Error('Answer not found');

    const answer = answers[idx];
    answer.reportedBy = answer.reportedBy || {};
    answer.reports = answer.reports || 0;

    if (!answer.reportedBy[uid]) {
      answer.reportedBy[uid] = true;
      answer.reports++;
    }

    answers[idx] = answer;
    tx.update(qRef, { answers });
  });
}
