import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';

// ✅ Dummy users
const DUMMY_USERS = [
  { id: 'u1', name: 'Alice Bot' },
  { id: 'u2', name: 'Bob Bot' },
  { id: 'u3', name: 'Charlie Bot' },
  { id: 'u4', name: 'Diana Bot' },
  { id: 'u5', name: 'Eve Bot' },
];

// ✅ Dummy logged-in user
const CURRENT_USER_ID = 'me';

export default function ChatServiceDemo() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-scroll when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedUser]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const newMsg = {
      sender: CURRENT_USER_ID,
      content: message.trim(),
      timestamp: new Date(),
    };

    setConversations((prev) => {
      const userMsgs = prev[selectedUser.id] || [];
      return { ...prev, [selectedUser.id]: [...userMsgs, newMsg] };
    });

    setMessage('');

    // Fake bot reply after 1.5s
    setTimeout(() => {
      const reply = {
        sender: selectedUser.id,
        content: `🤖 ${selectedUser.name} says: "${generateRandomReply()}"`,
        timestamp: new Date(),
      };
      setConversations((prev) => {
        const userMsgs = prev[selectedUser.id] || [];
        return { ...prev, [selectedUser.id]: [...userMsgs, reply] };
      });
    }, 1500);
  };

  const generateRandomReply = () => {
    const replies = [
      'Hello there!',
      'How’s your project going?',
      'That’s interesting!',
      'Tell me more…',
      '😂',
      '👍',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  return (
    <div className="chat-demo-container">
      {/* Sidebar */}
      <div className="chat-users">
        <h3>Contacts</h3>
        {DUMMY_USERS.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${selectedUser?.id === user.id ? 'active' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>{selectedUser.name}</h2>
            </div>

            <div className="chat-messages">
              {(conversations[selectedUser.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`chat-message ${
                    msg.sender === CURRENT_USER_ID ? 'sent' : 'received'
                  }`}
                >
                  <div className="chat-message-text">{msg.content}</div>
                  <div className="chat-message-meta">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
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
          </>
        ) : (
          <div className="chat-placeholder">Select a contact to start chatting</div>
        )}
      </div>
    </div>
  );
}
