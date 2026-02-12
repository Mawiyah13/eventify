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

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.get("/", getEvents);
router.get("/my-events", protect, getMyEvents);
router.get("/:id", getEventById);

// Admin
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);


// User registration
router.post("/:id/register", protect, registerForEvent);
router.post("/:id/unregister", protect, unregisterFromEvent);

// Admin registrations view
router.get("/:id/registrations", protect, adminOnly, getRegistrations);

export default router;
