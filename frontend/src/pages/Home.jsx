import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import EventCard from "../components/EventCard";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Auto-scroll carousel
    const interval = setInterval(() => {
      if (events.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(events.length / 3));
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [events.length]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(events.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(events.length / 3) - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Group events into slides of 3
  const slides = [];
  for (let i = 0; i < events.length; i += 3) {
    slides.push(events.slice(i, i + 3));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Find and join exciting events happening near you
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
            >
              Get Started
            </Link>
            <Link
              to="/dashboard"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition duration-300"
            >
              Browse All Events
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Easy Registration</h3>
            <p className="text-gray-600">
              Register for events with just a few clicks. Simple and hassle-free process.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Secure Payments</h3>
            <p className="text-gray-600">
              Pay securely with Razorpay. Support for cards, UPI, and net banking.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="text-5xl mb-4">🎊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Free & Paid Events</h3>
            <p className="text-gray-600">
              Choose from a variety of free and premium events tailored to your interests.
            </p>
          </div>
        </div>

        {/* Upcoming Events Carousel */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Upcoming Events
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No events available
              </h3>
              <p className="text-gray-500">Check back soon for exciting events!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2"
                    >
                      {slide.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-100 text-gray-800 p-4 rounded-full shadow-xl hover:shadow-2xl transition z-10"
                    aria-label="Previous slide"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-100 text-gray-800 p-4 rounded-full shadow-xl hover:shadow-2xl transition z-10"
                    aria-label="Next slide"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {slides.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        currentSlide === index
                          ? 'bg-purple-600 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            View All Events →
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event enthusiasts and never miss out on amazing experiences
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-purple-600 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;