import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [filterOption, setFilterOption] = useState("all");

  /* =========================
     FETCH EVENTS
  ========================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events");
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch events");
      }
    };

    fetchEvents();
  }, []);

  /* =========================
     REGISTER
  ========================= */
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

  /* =========================
     UNREGISTER
  ========================= */
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

      alert("Registration cancelled");
    } catch (error) {
      alert("Failed to cancel registration");
    }
  };

  /* =========================
     DELETE (ADMIN)
  ========================= */
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

  /* =========================
     FILTER + SORT
  ========================= */
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesFilter = true;

      if (filterOption === "available") {
        matchesFilter =
          event.registeredUsers.length < event.capacity;
      }

      if (filterOption === "full") {
        matchesFilter =
          event.registeredUsers.length >= event.capacity;
      }

      if (filterOption === "my") {
        matchesFilter =
          user.role === "user" &&
          event.registeredUsers.includes(user._id);
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortOption === "capacity") {
        return b.capacity - a.capacity;
      }

      if (sortOption === "availableSeats") {
        const aSeats = a.capacity - a.registeredUsers.length;
        const bSeats = b.capacity - b.registeredUsers.length;
        return bSeats - aSeats;
      }

      if (sortOption === "az") {
        return a.title.localeCompare(b.title);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  /* =========================
     BADGE STYLES
  ========================= */
  const badgeGreen = {
    backgroundColor: "#d4edda",
    color: "green",
    padding: "5px 10px",
    borderRadius: "20px",
    marginRight: "8px",
  };

  const badgeRed = {
    backgroundColor: "#f8d7da",
    color: "red",
    padding: "5px 10px",
    borderRadius: "20px",
    marginRight: "8px",
  };

  const badgeBlue = {
    backgroundColor: "#d1ecf1",
    color: "#007bff",
    padding: "5px 10px",
    borderRadius: "20px",
    marginRight: "8px",
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}</p>

      {/* ============================= */}
      {/* USER ONLY - MY REGISTERED */}
      {/* ============================= */}
      {user.role === "user" && (
        <>
          <h2>My Registered Events</h2>

          {events.filter((event) =>
            event.registeredUsers.includes(user._id)
          ).length === 0 ? (
            <p>No registered events yet.</p>
          ) : (
            events
              .filter((event) =>
                event.registeredUsers.includes(user._id)
              )
              .map((event) => (
                <div
                  key={event._id}
                  style={{
                    marginBottom: "15px",
                    padding: "15px",
                    border: "1px solid green",
                    borderRadius: "8px",
                    backgroundColor: "#f0fff4",
                  }}
                >
                  <h4>{event.title}</h4>
                  <button
                    onClick={() => handleUnregister(event._id)}
                  >
                    Cancel Registration
                  </button>
                </div>
              ))
          )}
        </>
      )}

      {/* ============================= */}
      {/* SEARCH / SORT / FILTER */}
      {/* ============================= */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        >
          <option value="newest">Newest</option>
          <option value="capacity">Capacity</option>
          <option value="availableSeats">Available Seats</option>
          <option value="az">A–Z</option>
        </select>

        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          style={{ padding: "6px" }}
        >
          <option value="all">All</option>
          <option value="available">Available Only</option>
          <option value="full">Full Only</option>
          {user.role === "user" && (
            <option value="my">My Events</option>
          )}
        </select>
      </div>

      <h2>Events</h2>

      {filteredEvents.map((event) => {
        const isRegistered =
          event.registeredUsers.includes(user._id);

        const isFull =
          event.registeredUsers.length >= event.capacity;

        return (
          <div
            key={event._id}
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>

            {/* USER BADGES */}
            {user.role === "user" && (
              <div style={{ marginBottom: "10px" }}>
                {isRegistered && (
                  <span style={badgeBlue}>
                    🔵 Registered
                  </span>
                )}

                {!isFull && !isRegistered && (
                  <span style={badgeGreen}>
                    🟢 Available
                  </span>
                )}

                {isFull && !isRegistered && (
                  <span style={badgeRed}>
                    🔴 Full
                  </span>
                )}
              </div>
            )}

            {/* ADMIN REGISTRATION COUNT */}
            {user.role === "admin" && (
              <p>
                Registered: {event.registeredUsers.length} /{" "}
                {event.capacity}
              </p>
            )}

            {/* USER BUTTONS */}
            {user.role === "user" && (
              <>
                {isRegistered ? (
                  <button disabled>Registered ✓</button>
                ) : isFull ? (
                  <button disabled>Event Full</button>
                ) : (
                  <button
                    onClick={() =>
                      handleRegister(event._id)
                    }
                  >
                    Register
                  </button>
                )}
              </>
            )}

            {/* ADMIN BUTTONS */}
            {user.role === "admin" && (
              <>
                <Link
                  to={`/admin/events/${event._id}/registrations`}
                >
                  <button>View Registrations</button>
                </Link>

                <button
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "red",
                    color: "white",
                  }}
                  onClick={() =>
                    handleDelete(event._id)
                  }
                >
                  Delete Event
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
