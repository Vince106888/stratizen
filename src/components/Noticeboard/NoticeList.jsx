import React from "react";
import NoticeItem from "./NoticeItem";

export default function NoticeList({ notices }) {
  if (!notices.length) return <p>No notices yet.</p>;

  return (
    <div className="notice-list">
      {notices.map(notice => (
        <NoticeItem key={notice.id} notice={notice} />
      ))}
    </div>
  );
}
