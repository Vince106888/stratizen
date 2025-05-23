// src/components/StudyHub/QuestionList.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import QuestionItem from './QuestionItem';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQuestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <p className="text-gray-500">No questions yet.</p>
      ) : (
        questions.map((q) => <QuestionItem key={q.id} question={q} />)
      )}
    </div>
  );
};

export default QuestionList;
