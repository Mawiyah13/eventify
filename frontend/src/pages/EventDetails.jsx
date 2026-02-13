import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEvent();
    loadRazorpayScript();
  }, [id, user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const fetchEvent = async () => {
    try {
      const response = await API.get(`/events/${id}`);
      const eventData = response.data;
      setEvent(eventData);

      if (user && eventData.registeredUsers) {
        const isRegistered = eventData.registeredUsers.some(
          (u) => u._id === user._id || u === user._id
        );
        setRegistered(isRegistered);
      }
    } catch (error) {
      console.error("Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);

    try {
      // Create order on backend
      const orderResponse = await API.post("/events/payment/create-order", {
        eventId: id,
        amount: event.price,
      });

      const { orderId, amount, currency, key } = orderResponse.data;

      const options = {
        key: key, // Use key from API response
        amount: amount,
        currency: currency,
        name: "Eventify",
        description: event.title,
        order_id: orderId,
        handler: async function (response) {
          // Verify payment on backend
          try {
            const verifyResponse = await API.post("/events/payment/verify", {
              eventId: id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              setRegistered(true);
              alert("Payment successful! You are now registered.");
              fetchEvent();
            }
          } catch (error) {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#9333EA",
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setProcessing(false);
    } catch (error) {
      alert("Failed to initiate payment");
      setProcessing(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isPaid = event.category === 'paid' || event.price > 0;

    if (isPaid) {
      // Initiate Razorpay payment
      handleRazorpayPayment();
    } else {
      // Free event - direct registration
      try {
        await API.post(`/events/${id}/register`);
        setRegistered(true);
        alert("Successfully registered!");
        fetchEvent();
      } catch (error) {
        alert(error.response?.data?.message || "Registration failed");
      }
    }
  };

  const handleUnregister = async () => {
    const confirmUnregister = window.confirm(
      "Are you sure you want to cancel your registration?"
    );
    if (!confirmUnregister) return;

    try {
      await API.post(`/events/${id}/unregister`);
      setRegistered(false);
      alert("Registration cancelled");
      fetchEvent();
    } catch (error) {
      alert("Failed to cancel registration");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Event not found</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isFull = event.registeredUsers?.length >= event.capacity;
  const availableSeats = event.capacity - (event.registeredUsers?.length || 0);
  const isPaid = event.category === 'paid' || event.price > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={
                event.imageUrl?.trim()
                  ? event.imageUrl
                  : "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Price Badge */}
            <div className="absolute top-6 right-6">
              {isPaid ? (
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl">
                  💳 ₹{event.price}
                </span>
              ) : (
                <span className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl">
                  🎁 FREE
                </span>
              )}
            </div>

            {/* Title */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {event.title}
              </h1>
              {event.organizer && (
                <p className="text-white/90 text-lg">
                  Organized by {event.organizer}
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  About This Event
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registrations */}
                {user && user.role === "admin" && (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Registered Attendees ({event.registeredUsers?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {event.registeredUsers && event.registeredUsers.length > 0 ? (
                        event.registeredUsers.map((attendee, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                              {attendee.name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{attendee.name}</p>
                              <p className="text-sm text-gray-500">{attendee.email}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No registrations yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 sticky top-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Event Details
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {event.duration && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-800">{event.duration}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-800">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="text-2xl">👥</span>
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-semibold text-gray-800">
                          {event.registeredUsers?.length || 0} / {event.capacity}
                        </p>
                      </div>
                    </div>

                    {isPaid && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="font-semibold text-gray-800">₹{event.price}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capacity Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Seats Available</span>
                      <span className="font-semibold">{availableSeats}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
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
                  </div>

                  {/* Registration Button */}
                  {user && user.role === "user" && (
                    <>
                      {registered ? (
                        <div>
                          <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 rounded-xl mb-4 text-center">
                            <p className="font-semibold">✓ You're Registered!</p>
                          </div>
                          <button
                            onClick={handleUnregister}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                          >
                            Cancel Registration
                          </button>
                        </div>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Event Full
                        </button>
                      ) : (
                        <button
                          onClick={handleRegister}
                          disabled={processing}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {processing ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            <>
                              {isPaid ? `Pay ₹${event.price} & Register` : 'Register for Free'}
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {!user && (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                    >
                      Login to Register
                    </button>
                  )}

                  {user && user.role === "admin" && (
                    <div className="space-y-2 mt-4">
                      <button
                        onClick={() => navigate(`/event/edit/${id}`)}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                      >
                        Edit Event
                      </button>
                    </div>
                  )}

                  {/* Razorpay Badge */}
                  {isPaid && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Secure payment powered by Razorpay
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;