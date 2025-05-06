import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { app } from "../services/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);
const auth = getAuth(app);

const Messages = () => {
  const [threads, setThreads] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const threadQuery = query(
        collection(db, "messages"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(threadQuery);
      const threadsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setThreads(threadsArray);
    } catch (err) {
      setError("Error fetching threads: " + err.message);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const messagesQuery = query(
        collection(db, `messages/${threadId}/messages`),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(messagesQuery);
      const messagesArray = querySnapshot.docs.map((doc) => doc.data());
      setMessages(messagesArray);
    } catch (err) {
      setError("Error fetching messages: " + err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError("Please enter a message.");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in first.");
      return;
    }

    try {
      await addDoc(collection(db, `messages/${selectedThread.id}/messages`), {
        content: newMessage,
        sender: user.displayName || "Anonymous",
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setSuccess("Message sent!");
      setNewMessage("");
      fetchMessages(selectedThread.id);
    } catch (err) {
      setError("Error sending message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
    setMessages([]);
    fetchMessages(thread.id);
  };

  const handleCreateNewThread = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/auth");
      return;
    }

    const threadName = prompt("Enter the name of the new thread");
    if (!threadName) return;

    try {
      const docRef = await addDoc(collection(db, "messages"), {
        name: threadName,
        participants: [user.uid],
        createdAt: serverTimestamp(),
      });
      setSuccess("Thread created successfully!");
      fetchThreads();
    } catch (err) {
      setError("Error creating thread: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 mt-10 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Messages</h2>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Threads</h3>
        <button
          onClick={handleCreateNewThread}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
        >
          Create New Thread
        </button>
      </div>

      <div className="space-y-4">
        {threads.length === 0 ? (
          <p>No threads found. Create a new one to get started!</p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleSelectThread(thread)}
              className="p-4 border rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
            >
              <h4 className="text-xl font-semibold">{thread.name}</h4>
              <p className="text-gray-500">Participants: {thread.participants.length}</p>
            </div>
          ))
        )}
      </div>

      {selectedThread && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold">Messages in "{selectedThread.name}"</h3>
          <div className="space-y-4 mt-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-4 border rounded-lg shadow-sm">
                <p className="font-semibold">{msg.sender}</p>
                <p className="text-gray-700">{msg.content}</p>
                <p className="text-xs text-gray-500">{new Date(msg.createdAt.seconds * 1000).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <textarea
              className="w-full p-4 border rounded-lg mt-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              rows="3"
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-600 text-white px-6 py-2 mt-2 rounded hover:bg-green-800 transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
