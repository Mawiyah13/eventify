import Event from "../models/Event.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Lazy-load Razorpay to ensure environment variables are loaded and trimmed
let razorpay = null;
const getRazorpayInstance = () => {
  if (!razorpay) {
    console.log("Initializing Razorpay instance...");
    // Trim env values to avoid accidental whitespace/newline issues
    const keyIdRaw = process.env.RAZORPAY_KEY_ID || "";
    const keySecretRaw = process.env.RAZORPAY_KEY_SECRET || "";
    const keyId = keyIdRaw.trim();
    const keySecret = keySecretRaw.trim();

    const maskedKeyId = keyId ? keyId.replace(/.(?=.{4})/g, "*") : "(not set)";
    console.log("Razorpay init - keyId present:", !!keyId, "maskedKeyId:", maskedKeyId, "secretPresent:", !!keySecret);

    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
};

/* =======================
   GET ALL EVENTS WITH FILTERS
   ======================= */
export const getEvents = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let events = await Event.find(query);

    // Sorting
    if (sort === 'price-low') {
      events = events.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      events = events.sort((a, b) => b.price - a.price);
    } else if (sort === 'date') {
      events = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      events = events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET SINGLE EVENT
   ======================= */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredUsers', 'name email')
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   CREATE EVENT (ADMIN)
   ======================= */
export const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      capacity, 
      location, 
      date, 
      imageUrl,
      price,
      category,
      duration,
      organizer,
      tags
    } = req.body;

    const event = await Event.create({
      title,
      description,
      capacity,
      location,
      date,
      imageUrl,
      price: price || 0,
      category: price > 0 ? 'paid' : 'free',
      duration,
      organizer,
      tags,
      registeredUsers: [],
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.log("CREATE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   UPDATE EVENT (ADMIN)
   ======================= */
export const updateEvent = async (req, res) => {
  try {
    // Auto-set category based on price
    if (req.body.price !== undefined) {
      req.body.category = req.body.price > 0 ? 'paid' : 'free';
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   DELETE EVENT (ADMIN)
   ======================= */
export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   REGISTER FOR EVENT (USER)
   ======================= */
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent duplicate registration
    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ message: "Already registered" });
    }

    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.registeredUsers.push(req.user._id);
    await event.save();

    res.json({ 
      message: "Successfully registered for event",
      event: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   UNREGISTER FROM EVENT (USER)
   ======================= */
export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is registered
    if (!event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ message: "Not registered for this event" });
    }

    // Remove user
    event.registeredUsers = event.registeredUsers.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await event.save();

    res.json({ message: "Unregistered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   VIEW REGISTRATIONS (ADMIN)
   ======================= */
export const getRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "registeredUsers",
      "name email"
    );

    res.json(event.registeredUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET MY REGISTERED EVENTS (USER)
   ======================= */
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      registeredUsers: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   PROCESS PAYMENT (Simulated)
   ======================= */
export const processPayment = async (req, res) => {
  try {
    const { eventId, paymentMethod } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Simulate payment processing
    // In real app, integrate with Stripe, PayPal, etc.
    const paymentSuccess = true;

    if (paymentSuccess) {
      // Register user after successful payment
      if (!event.registeredUsers.includes(req.user._id)) {
        event.registeredUsers.push(req.user._id);
        await event.save();
      }

      res.json({
        success: true,
        message: "Payment successful! You are now registered.",
        transactionId: `TXN${Date.now()}`,
        event: event
      });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   CREATE RAZORPAY ORDER
   ======================= */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { eventId, amount } = req.body;

    if (!eventId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing eventId or amount" 
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate Razorpay credentials exist
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials not configured");
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured",
      });
    }

    // Create order in Razorpay
    console.log("Creating Razorpay order - eventId:", eventId, "amount:", amount, "keyId:", (process.env.RAZORPAY_KEY_ID || '(not set)'), "secretPresent:", !!process.env.RAZORPAY_KEY_SECRET);
    const options = {
      amount: amount * 100, // amount in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `event_${eventId}_${Date.now()}`,
      notes: {
        eventId: eventId,
        eventTitle: event.title,
        userId: req.user._id.toString(),
        userName: req.user.name,
      },
    };

    const order = await getRazorpayInstance().orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order",
      error: error.message 
    });
  }
};

/* =======================
   VERIFY RAZORPAY PAYMENT
   ======================= */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      eventId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Signature is valid - Register user for event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    // Check if already registered
    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already registered",
      });
    }

    // Check capacity
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Add user to registered users
    event.registeredUsers.push(req.user._id);
    await event.save();

    res.json({
      success: true,
      message: "Payment verified and registration successful",
      event: event,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/* =======================
   GET PAYMENT DETAILS (Optional)
   ======================= */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await getRazorpayInstance().payments.fetch(paymentId);

    res.json({
      success: true,
      payment: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
    });
  }
};


