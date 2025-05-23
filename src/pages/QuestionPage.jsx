import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import '../styles/StudyHub.css';

const QuestionPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      const docRef = doc(db, "questions", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };

    fetchQuestion();
  }, [id]);

  useEffect(() => {
    const q = query(collection(db, `questions/${id}/answers`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAnswers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnswers(fetchedAnswers);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    await addDoc(collection(db, `questions/${id}/answers`), {
      text: newAnswer.trim(),
      userId: user?.uid,
      createdAt: new Date(),
    });

    setNewAnswer("");
  };

  if (loading) return <div className="p-4 text-gray-500">Loading question...</div>;
  if (!question) return <div className="p-4 text-red-500">Question not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
      <p className="text-gray-700 mb-4">{question.description}</p>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-2">Answers</h2>
      <div className="space-y-3">
        {answers.length > 0 ? answers.map((answer) => (
          <div key={answer.id} className="bg-gray-100 p-3 rounded-lg border">
            <p>{answer.text}</p>
          </div>
        )) : <p className="text-gray-500">No answers yet. Be the first to answer!</p>}
      </div>

      {user && (
        <form onSubmit={handleAnswerSubmit} className="mt-6">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer..."
            className="w-full p-3 border rounded-lg mb-2"
            rows="4"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Answer
          </button>
        </form>
      )}
    </div>
  );
};

export default QuestionPage;
