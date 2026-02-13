import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  const isFull =
    event.registeredUsers?.length >= event.capacity;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-1 overflow-hidden">

      {/* 🖼 Image */}
      <div className="h-48 w-full overflow-hidden">
        <img
          src={
            event.imageUrl?.trim()
              ? event.imageUrl
              : "https://images.unsplash.com/photo-1511578314322-379afb476865"
          }
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 📄 Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.description}
        </p>

        <div className="text-sm text-gray-500 mb-3 space-y-1">
          <p>📍 {event.location}</p>
          <p>📅 {new Date(event.date).toLocaleDateString()}</p>
        </div>

        {/* Status Badge */}
        {isFull ? (
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600 mb-4">
            🔴 Full
          </span>
        ) : (
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600 mb-4">
            🟢 Available
          </span>
        )}

        {/* Button */}
        <Link
          to={`/event/${event._id}`}
          className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium hover:opacity-90 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
