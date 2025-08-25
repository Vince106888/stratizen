// src/components/Stratizen/Reactions.jsx
import React from "react";
import {
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Angry,
} from "lucide-react";
import "../../styles/Stratizen/StratizenFeed.css";

// Map reaction type to Lucide icons
const reactionIcons = {
  like: <ThumbsUp size={18} />,
  love: <Heart size={18} />,
  haha: <Laugh size={18} />,
  sad: <Frown size={18} />,
  angry: <Angry size={18} />,
};

const reactionTypes = Object.keys(reactionIcons);

export default function Reactions({ reactions = {}, userReaction, onReact }) {
  return (
    <div className="reactions">
      {reactionTypes.map((type) => {
        const count = reactions[type] || 0;
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            className={`reaction-btn ${isActive ? "active" : ""}`}
            onClick={() => onReact(type)}
            title={type}
            aria-pressed={isActive}
            type="button"
          >
            {reactionIcons[type]}{" "}
            {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
