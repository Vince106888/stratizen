import React, { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../../styles/Stratizen/StratizenFeed.css";

// Map reaction type to emoji/icon
const reactionIcons = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  sad: "😢",
  angry: "😡",
};

const reactionTypes = Object.keys(reactionIcons);

export default function Reactions({ reactions = {}, postId, currentUser }) {
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    for (const type of reactionTypes) {
      if (reactions[type]?.includes(currentUser.uid)) {
        setUserReaction(type);
        break;
      }
    }
  }, [reactions, currentUser]);

  const toggleReaction = async (type) => {
    if (!currentUser) return;
    const currentUid = currentUser.uid;
    const postRef = doc(db, "posts", postId);

    // Optimistic UI update
    setUserReaction((prev) => (prev === type ? null : type));

    try {
      if (userReaction === type) {
        // Remove current reaction
        await updateDoc(postRef, {
          [`reactions.${type}`]: arrayRemove(currentUid),
        });
      } else {
        const updates = {};
        if (userReaction) {
          updates[`reactions.${userReaction}`] = arrayRemove(currentUid);
        }
        updates[`reactions.${type}`] = arrayUnion(currentUid);
        await updateDoc(postRef, updates);
      }
    } catch (error) {
      console.error("Failed to update reaction:", error);
      // Rollback on failure
      setUserReaction(userReaction);
    }
  };

  return (
    <div className="reactions">
      {reactionTypes.map((type) => {
        const count = reactions[type]?.length || 0;
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            className={`reaction-btn ${isActive ? "active" : ""}`}
            onClick={() => toggleReaction(type)}
            title={type}
            aria-pressed={isActive}
            type="button"
          >
            {reactionIcons[type]} {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
