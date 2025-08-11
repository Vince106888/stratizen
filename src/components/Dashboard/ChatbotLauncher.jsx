import React from 'react';
import '../../styles/Dashboard/ChatbotLauncher.css';

export default function ChatbotLauncher({ onClick }) {
  return (
    <button
      type="button"
      className="chatbot-launcher"
      onClick={onClick}
      aria-label="Open Stratizen Chatbot"
      title="Open Stratizen Chatbot"
    >
      🤖 Talk to Stratizen Bot
    </button>
  );
}
