// src/components/Dashboard/ChatbotModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import '../../styles/Dashboard/ChatbotModal.css';

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Secure in backend in production

export default function ChatbotModal({ onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am Stratizen Bot. How can I assist you today?' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for the Stratizen platform.' },
            ...messages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: userMessage.text },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('OpenAI API error');
      const data = await response.json();
      const botReply = data.choices[0].message.content;

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-modal-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
        <header className="chatbot-header">
          <h2>Stratizen Bot</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close chatbot">
            <X size={20} />
          </button>
        </header>

        <section className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="chat-message bot">Typing...</div>}
          {error && <div className="chat-error">{error}</div>}
          <div ref={chatEndRef} />
        </section>

        <footer className="chatbot-footer">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}
