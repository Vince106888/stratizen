import React, { useState, useEffect, useRef } from "react";
import "../styles/Chat.css";
import { MessageService } from "../services/MessageService";
import { FaPaperPlane } from "react-icons/fa";
import { FiUser } from "react-icons/fi";

export default function Chat({ currentUser }) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadUsers = async () => {
      const list = await MessageService.getUsers();
      setUsers(list.filter((u) => u !== currentUser));
      if (list.length > 0) setSelectedUser(list[0]); // auto-select first
    };
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUser) return;
    const loadMessages = async () => {
      const convo = await MessageService.getConversation(
        currentUser,
        selectedUser
      );
      setConversation(convo);
    };
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [currentUser, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    await MessageService.sendMessage({
      sender: currentUser,
      receiver: selectedUser,
      content: message,
    });
    setMessage("");
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <FiUser size={20} />
          <span>{selectedUser ? `Chat with ${selectedUser}` : "Select a user"}</span>
        </div>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="chat-user-select"
        >
          {users.map((u, i) => (
            <option key={i} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === currentUser ? "sent" : "received"
            }`}
          >
            <div className="chat-message-text">{msg.content}</div>
            <div className="chat-message-meta">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder={`Message ${selectedUser || "someone"}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
