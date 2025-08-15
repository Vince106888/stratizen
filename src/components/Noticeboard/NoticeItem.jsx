import React from "react";

export default function NoticeItem({ notice }) {
  return (
    <div className={`notice-card ${notice.pinned ? "pinned" : ""}`}>
      <h3>{notice.title}</h3>
      <p>{notice.content}</p>
      <small>By: {notice.authorName}</small>
    </div>
  );
}
