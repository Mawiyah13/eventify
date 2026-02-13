import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  const isFull = event.registeredUsers?.length >= event.capacity;
  const availableSeats = event.capacity - (event.registeredUsers?.length || 0);
  const isPaid = event.category === 'paid' || event.price > 0;

  return (
    
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
      {/* Image */}
      <div className="h-52 w-full overflow-hidden relative">
        <img
          src={
            event.imageUrl?.trim()
              ? event.imageUrl
              : "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          {isPaid ? (
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              💳 ${event.price}
            </span>
          ) : (
            <span className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              🎁 FREE
            </span>
          )}
        </div>

        {/* Full Badge */}
        {isFull && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              🔴 FULL
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-purple-600 transition">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            <span>{new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
          {event.duration && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">⏱️</span>
              <span>{event.duration}</span>
            </div>
          )}
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Capacity</span>
            <span className="font-semibold">
              {event.registeredUsers?.length || 0}/{event.capacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-red-500'
                  : availableSeats < 10
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${((event.registeredUsers?.length || 0) / event.capacity) * 100}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isFull ? 'Event is full' : `${availableSeats} seats available`}
          </p>
        </div>

        {/* Button */}
        <Link
          to={`/event/${event._id}`}
          className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default EventCard;