// src/components/Profile/ProfileMessaging.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageService } from "../../services/MessageService";
import "../../styles/Profile/ProfileMessaging.css";

export default function ProfileMessaging({ userId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    async function fetchConversations() {
      try {
        setLoading(true);
        const convos = await MessageService.getUserConversations(userId); // implement in MessageService
        if (isMounted) {
          setConversations(convos);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load messages.");
          setLoading(false);
        }
      }
    }

    fetchConversations();

    // Optional: polling every 10 seconds for updates
    const interval = setInterval(fetchConversations, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p className="error-message">{error}</p>;

  if (conversations.length === 0)
    return <p>You have no messages yet. Start a conversation!</p>;

  return (
    <div className="profile-messaging-container">
      <h3>Recent Conversations</h3>
      <ul className="conversation-list">
        {conversations.slice(0, 5).map((conv) => {
          const { conversationId, lastMessage, participantName, unreadCount } =
            conv;

          return (
            <li
              key={conversationId}
              className={`conversation-item ${unreadCount > 0 ? "unread" : ""}`}
              onClick={() => navigate(`/messages/${conversationId}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/messages/${conversationId}`)
              }
            >
              <div className="participant-name">{participantName}</div>
              <div className="last-message">{lastMessage}</div>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </li>
          );
        })}
      </ul>
      <button onClick={() => navigate("/messages")} className="view-all-btn">
        View All Messages
      </button>
    </div>
  );
}
