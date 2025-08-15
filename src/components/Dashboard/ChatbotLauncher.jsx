// src/components/Dashboard/ChatbotLauncher.jsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
import '../../styles/Dashboard/ChatbotLauncher.css';

export default function ChatbotLauncher({ onClick }) {
  return (
    <button
      type="button"
      className="chatbot-launcher"
      onClick={onClick}
      aria-label="Open Stratizen Chatbot"
      title="Talk to Stratizen Bot"
    >
      <MessageCircle size={26} />
    </button>
  );
}
