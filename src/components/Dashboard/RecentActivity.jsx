// src/components/Dashboard/RecentActivity.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/RecentActivity.css';

/**
 * Main RecentActivity section
 */
export default function RecentActivity({ activity }) {
  return (
    <section className="recent-activity" role="region" aria-label="Recent user activity">
      <h2>Recent Activity</h2>
      <ActivityList title="Messages" items={activity.messages} type="messages" />
      <ActivityList title="Forum Posts" items={activity.forum} type="forum" />
      <ActivityList title="Marketplace" items={activity.marketplace} type="marketplace" />
    </section>
  );
}

/**
 * List of activity items per type
 */
function ActivityList({ title, items, type }) {
  return (
    <div className="activity-list">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="empty-msg">No recent {title.toLowerCase()}.</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {type === 'messages' && <MessagePreview message={item} />}
              {type === 'forum' && <ForumPostPreview post={item} />}
              {type === 'marketplace' && <MarketplaceItemPreview item={item} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Message preview component
 */
function MessagePreview({ message }) {
  const dateStr = message.lastUpdated
    ? new Date(message.lastUpdated.seconds * 1000).toLocaleString()
    : 'Unknown';

  return (
    <Link
      to={`/messages/${message.id}`}
      className="activity-link"
      title="View message"
      aria-label={`Message: ${message.title || 'Conversation'}, last updated ${dateStr}`}
    >
      <strong>{message.title || 'Conversation'}</strong>
      <span className="activity-date"> — Last updated: {dateStr}</span>
    </Link>
  );
}

/**
 * Forum post preview component
 */
function ForumPostPreview({ post }) {
  const dateStr = post.createdAt
    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
    : 'Unknown';

  return (
    <Link
      to={`/forum/${post.id}`}
      className="activity-link"
      title="View forum post"
      aria-label={`Forum post: ${post.title}, created on ${dateStr}`}
    >
      <strong>{post.title}</strong>
      <span className="activity-date"> — Created on: {dateStr}</span>
    </Link>
  );
}

/**
 * Marketplace item preview component
 */
function MarketplaceItemPreview({ item }) {
  const dateStr = item.createdAt
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
    : 'Unknown';

  return (
    <Link
      to={`/marketplace/${item.id}`}
      className="activity-link"
      title="View marketplace item"
      aria-label={`Marketplace item: ${item.title}, listed on ${dateStr}`}
    >
      <strong>{item.title}</strong>
      <span className="activity-date"> — Listed on: {dateStr}</span>
    </Link>
  );
}
