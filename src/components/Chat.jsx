import React, { useState, useEffect } from 'react';
import '../styles/Chat.css';
import { MessageService } from '../services/MessageService';

export default function Chat({ currentUser, selectedUser }) {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      const convo = await MessageService.getConversation(currentUser, selectedUser);
      setConversation(convo);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [currentUser, selectedUser]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await MessageService.sendMessage({
      sender: currentUser,
      receiver: selectedUser,
      content: message,
    });

    setMessage('');
    const updatedConversation = await MessageService.getConversation(currentUser, selectedUser);
    setConversation(updatedConversation);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {selectedUser}</h2>
      </div>

      <div className="chat-messages">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === currentUser ? 'sent' : 'received'
            }`}
          >
            <div className="chat-message-text">{msg.content}</div>
            <div className="chat-message-meta">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
