import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">

      {/* 🖼 Event Image */}
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-1">
          📅 {new Date(event.date).toLocaleDateString()}
        </p>

        <p className="text-gray-600 text-sm mb-3">
          📍 {event.location}
        </p>

        <Link
          to={`/event/${event._id}`}
          className="inline-block mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:scale-105 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
