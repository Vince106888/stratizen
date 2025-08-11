import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/RecentActivity.css';

export default function RecentActivity({ activity }) {
  return (
    <section className="recent-activity">
      <h2>Recent Activity</h2>
      <ActivityList title="Messages" items={activity.messages} type="messages" />
      <ActivityList title="Forum Posts" items={activity.forum} type="forum" />
      <ActivityList title="Marketplace" items={activity.marketplace} type="marketplace" />
    </section>
  );
}

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

function MessagePreview({ message }) {
  return (
    <Link to={`/messages/${message.id}`} className="activity-link" title="View message">
      <strong>{message.title || 'Conversation'}</strong>
      <span className="activity-date">
        {' '}
        — Last updated: {new Date(message.lastUpdated?.seconds * 1000).toLocaleString()}
      </span>
    </Link>
  );
}

function ForumPostPreview({ post }) {
  return (
    <Link to={`/forum/${post.id}`} className="activity-link" title="View forum post">
      <strong>{post.title}</strong>
      <span className="activity-date">
        {' '}
        — Created on: {new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}
      </span>
    </Link>
  );
}

function MarketplaceItemPreview({ item }) {
  return (
    <Link to={`/marketplace/${item.id}`} className="activity-link" title="View marketplace item">
      <strong>{item.title}</strong>
      <span className="activity-date">
        {' '}
        — Listed on: {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
      </span>
    </Link>
  );
}
