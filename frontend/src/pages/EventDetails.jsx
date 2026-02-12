import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);

  // Fetch single event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await API.get(`/events/${id}`);
        const eventData = response.data;
        setEvent(eventData);

        // 🔐 FRONTEND registration check
        if (
          user &&
          eventData.registeredUsers &&
          eventData.registeredUsers.includes(user._id)
        ) {
          setRegistered(true);
        }
      } catch (error) {
        console.error("Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  // Register for event
  const handleRegister = async () => {
    try {
      await API.post(`/events/${id}/register`);
      setRegistered(true);
      alert("Successfully registered!");
    } catch (error) {
      alert("Already registered");
    }
  };


  // Delete event (Admin)
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/events/${id}`);
      navigate("/");
    } catch (error) {
      alert("Failed to delete event");
    }
  };

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{event.title}</h1>

      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p>{event.description}</p>

      {/* USER REGISTRATION UI */}
      {user && user.role === "user" && !registered && (
        <button onClick={handleRegister} style={{ marginTop: "10px" }}>
          Register for Event
        </button>
      )}

      {user && user.role === "user" && registered && (
        <p style={{ color: "green", marginTop: "10px" }}>
          You are already registered for this event.
        </p>
      )}

      {/* ADMIN ACTIONS */}
      {user && user.role === "admin" && (
        <div style={{ marginTop: "15px" }}>
          <Link to={`/event/edit/${event._id}`}>Edit Event</Link>
          {" | "}
          <button onClick={handleDelete}>Delete Event</button>
          {" | "}
          <Link to={`/admin/event/${event._id}/registrations`}>
            View Registrations
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
