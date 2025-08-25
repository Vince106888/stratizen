// src/components/Marketplace/ListingCard.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";

const ListingCard = ({ listing, handleMessageSeller }) => {
  const {
    imageUrl,
    title = "Untitled Item",
    description = "",
    price,
    category = "General",
    userName = "Anonymous",
    userId,
    createdAt,
  } = listing || {};

  const truncatedDescription =
    description.length > 80 ? description.slice(0, 80) + "..." : description;

  const formattedPrice =
    typeof price === "number" ? `$${price.toFixed(2)}` : "Price on request";

  const postedTime = createdAt?.seconds
    ? formatDistanceToNow(new Date(createdAt.seconds * 1000), {
        addSuffix: true,
      })
    : "Just now";

  return (
    <div className="listing-card bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-200">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="listing-image w-full h-48 object-cover rounded-xl mb-2"
        />
      )}

      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h4>

      <p
        className="text-sm text-gray-600 dark:text-gray-300"
        title={description}
      >
        {truncatedDescription}
      </p>

      <p className="price text-base font-bold text-strathmore-blue dark:text-strathmore-gold">
        {formattedPrice}
      </p>

      <p className="category text-sm text-gray-500 dark:text-gray-400">
        Category: {category}
      </p>

      <p className="seller text-sm text-gray-500 dark:text-gray-400">
        Posted by: {userName}
      </p>

      <p className="time text-xs text-gray-400">{postedTime}</p>

      {handleMessageSeller && (
        <button
          onClick={() => handleMessageSeller(userId)}
          className="message-btn mt-2 bg-strathmore-blue text-white dark:bg-strathmore-gold dark:text-black py-2 px-4 rounded-xl hover:opacity-90 transition"
        >
          Message Seller
        </button>
      )}
    </div>
  );
};

export default ListingCard;
