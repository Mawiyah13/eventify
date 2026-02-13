import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CreateEvent = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/events", {
        title,
        description,
        capacity: Number(capacity),
        location,
        date,
        imageUrl: imageUrl.trim(),
      });

      alert("Event created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Event</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Event Title</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Description</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Location</label><br />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Date</label><br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Capacity</label><br />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Image URL (optional)</label><br />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Event</button>

      </form>
    </div>
  );
};

export default CreateEvent;
