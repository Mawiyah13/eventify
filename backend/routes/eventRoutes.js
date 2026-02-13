import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getRegistrations,
  unregisterFromEvent,
  getMyEvents,
} from "../controllers/eventController.js";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentDetails,
} from "../controllers/eventController.js"; // or paymentController.js if separate

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Payment routes (must come before /:id routes)
router.post("/payment/create-order", protect, createRazorpayOrder);
router.post("/payment/verify", protect, verifyRazorpayPayment);
router.get("/payment/:paymentId", protect, getPaymentDetails);

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// User routes (protected)
router.get("/user/my-events", protect, getMyEvents);
router.post("/:id/register", protect, registerForEvent);
router.post("/:id/unregister", protect, unregisterFromEvent);

// Admin routes
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);
router.get("/:id/registrations", protect, adminOnly, getRegistrations);

export default router;