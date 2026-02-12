import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch existing event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await API.get(`/events/${id}`);
        const event = response.data;

        setTitle(event.title);
        setDate(event.date);
        setLocation(event.location);
        setDescription(event.description);
      } catch (error) {
        console.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/events/${id}`, {
        title,
        date,
        location,
        description,
      });

      navigate(`/event/${id}`);
    } catch (error) {
      console.error("Update failed");
      alert("Failed to update event");
    }
  };

  if (loading) return <p>Loading event...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Event</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Date:</label><br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Location:</label><br />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Description:</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <br />

        <button type="submit">Update Event</button>
      </form>
    </div>
  );
};

export default EditEvent;
