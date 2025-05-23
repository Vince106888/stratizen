import React, { useState, useEffect } from 'react';
import '../styles/StudyHub.css';
import QuestionForm from '../components/StudyHub/QuestionForm';
import QuestionList from '../components/StudyHub/QuestionList';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase'; // Your firebase config

const StudyHub = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Subscribe to questions collection
    const unsubscribe = onSnapshot(collection(db, 'questions'), (snapshot) => {
      const questionsArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsArr);
      console.log('Fetched questions:', questionsArr);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📚 Study Hub</h1>
      <QuestionForm />
      <hr className="my-6" />
      <QuestionList questions={questions} />
    </div>
  );
};

export default StudyHub;

