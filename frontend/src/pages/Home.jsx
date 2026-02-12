import React, { useEffect, useState } from "react";
import API from "../services/api";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get("/events");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      {/* 🌟 HERO SECTION */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Discover & Manage Amazing Events
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Eventify helps you create, manage, and attend events effortlessly.
          Explore exciting upcoming events and be part of something amazing.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transition"
          >
            Get Started
          </Link>

          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* 📅 EVENTS SECTION */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Upcoming Events
        </h2>

        {loading && (
          <p className="text-gray-500">Loading events...</p>
        )}

        {!loading && events.length === 0 && (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-lg">
              No events available at the moment.
            </p>
          </div>
        )}

        {/* 🧩 Event Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
