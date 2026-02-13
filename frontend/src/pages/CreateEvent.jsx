import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    capacity: "",
    location: "",
    date: "",
    imageUrl: "",
    price: "0",
    duration: "",
    organizer: "",
    tags: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = "Valid capacity required";
    if (formData.price < 0) newErrors.price = "Price cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

      await API.post("/events", {
        ...formData,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        tags: tagsArray,
      });

      alert("Event created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create event");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Create New Event
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details to create an amazing event
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                  errors.title
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-200 focus:border-purple-500'
                }`}
                placeholder="e.g., Tech Conference 2024"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                  errors.description
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-200 focus:border-purple-500'
                }`}
                placeholder="Describe your event..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                    errors.location
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                  placeholder="e.g., New York City"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                    errors.date
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Capacity & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                    errors.capacity
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                  placeholder="e.g., 100"
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                      errors.price
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-200 focus:border-purple-500'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set to 0 for free events
                </p>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Duration & Organizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                  placeholder="e.g., 2 hours, 1 day"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                  placeholder="e.g., Tech Corp"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default image
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
                placeholder="e.g., tech, conference, networking"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Preview */}
            {formData.price > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <p className="text-yellow-800 font-medium">
                  💳 This will be a paid event (${formData.price})
                </p>
              </div>
            )}

            {formData.price === "0" && (
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                <p className="text-green-800 font-medium">
                  🎁 This will be a free event
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;