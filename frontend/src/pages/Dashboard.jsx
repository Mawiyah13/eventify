import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [filterOption, setFilterOption] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my'

  useEffect(() => {
    fetchEvents();
    if (user && user.role === "user") {
      fetchMyEvents();
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events");
    }
  };

  const fetchMyEvents = async () => {
    try {
      const res = await API.get("/events/user/my-events");
      setMyEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch my events");
    }
  };

  const handleRegister = async (id) => {
    try {
      await API.post(`/events/${id}/register`);
      setEvents((prev) =>
        prev.map((event) =>
          event._id === id
            ? {
                ...event,
                registeredUsers: [...event.registeredUsers, user._id],
              }
            : event
        )
      );
      fetchMyEvents();
      alert("Registered successfully!");
    } catch (error) {
      if (error.response?.data?.message === "Already registered") {
        alert("You are already registered");
      } else if (error.response?.data?.message === "Event is full") {
        alert("Event is full");
      } else {
        alert("Registration failed");
      }
    }
  };

  const handleUnregister = async (id) => {
    try {
      await API.post(`/events/${id}/unregister`);
      setEvents((prev) =>
        prev.map((event) =>
          event._id === id
            ? {
                ...event,
                registeredUsers: event.registeredUsers.filter(
                  (uid) => uid !== user._id
                ),
              }
            : event
        )
      );
      fetchMyEvents();
      alert("Registration cancelled");
    } catch (error) {
      alert("Failed to cancel registration");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((event) => event._id !== id));
      alert("Event deleted successfully");
    } catch (error) {
      alert("Failed to delete event");
    }
  };

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesFilter = true;

      if (filterOption === "free") {
        matchesFilter = event.category === "free" || event.price === 0;
      }

      if (filterOption === "paid") {
        matchesFilter = event.category === "paid" || event.price > 0;
      }

      if (filterOption === "available") {
        matchesFilter = event.registeredUsers.length < event.capacity;
      }

      if (filterOption === "full") {
        matchesFilter = event.registeredUsers.length >= event.capacity;
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortOption === "capacity") {
        return b.capacity - a.capacity;
      }

      if (sortOption === "price-low") {
        return a.price - b.price;
      }

      if (sortOption === "price-high") {
        return b.price - a.price;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            {user.role === "admin"
              ? "Manage your events and view registrations"
              : "Discover and register for exciting events"}
          </p>
        </div>

        {/* Admin Create Button */}
        {user.role === "admin" && (
          <div className="mb-8">
            <Link
              to="/create-event"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
            >
              + Create New Event
            </Link>
          </div>
        )}

        {/* User Tabs */}
        {user.role === "user" && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-2 inline-flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Events ({filteredEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  activeTab === "my"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                My Events ({myEvents.length})
              </button>
            </div>
          </div>
        )}

        {/* My Events Section (Users Only) */}
        {user.role === "user" && activeTab === "my" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              My Registered Events
            </h2>

            {myEvents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🎟️</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No registered events yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start exploring and register for events you're interested in
                </p>
                <button
                  onClick={() => setActiveTab("all")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <div key={event._id} className="relative">
                    <EventCard event={event} />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ✓ Registered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Events Section */}
        {(user.role === "admin" || activeTab === "all") && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="🔍 Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                />

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                >
                  <option value="newest">Newest</option>
                  <option value="capacity">Capacity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <select
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                >
                  <option value="all">All Events</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>

            {/* Events Grid */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {filterOption === "all" ? "All Events" : `${filterOption.charAt(0).toUpperCase() + filterOption.slice(1)} Events`}
            </h2>

            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const isRegistered = event.registeredUsers.includes(user._id);
                  const isFull = event.registeredUsers.length >= event.capacity;

                  return (
                    <div key={event._id} className="relative">
                      <EventCard event={event} />
                      
                      {/* Admin Actions */}
                      {user.role === "admin" && (
                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/admin/events/${event._id}/registrations`}
                            className="flex-1 bg-blue-600 text-white text-center py-2 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
                          >
                            View ({event.registeredUsers.length})
                          </Link>
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium hover:bg-red-700 transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {/* User Quick Actions */}
                      {user.role === "user" && (
                        <div className="mt-4">
                          {isRegistered ? (
                            <button
                              onClick={() => handleUnregister(event._id)}
                              className="w-full bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600 transition"
                            >
                              Cancel Registration
                            </button>
                          ) : isFull ? (
                            <button
                              disabled
                              className="w-full bg-gray-400 text-white py-2 rounded-xl font-medium cursor-not-allowed"
                            >
                              Event Full
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;