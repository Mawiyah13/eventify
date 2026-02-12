import React, { useEffect, useState } from "react";
import API from "../services/api";

const MyEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await API.get("/events/my-events");
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch my events");
      }
    };

    fetchMyEvents();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Registered Events</h1>

      {events.length === 0 ? (
        <p>You have not registered for any events.</p>
      ) : (
        events.map((event) => (
          <div key={event._id} style={{ marginBottom: "20px" }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyEvents;
