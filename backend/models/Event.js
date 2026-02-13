import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    capacity: {
      type: Number,
      required: true,
      default: 80,
    },
    imageUrl: {
      type: String,
    },
    // NEW FIELDS
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      enum: ['free', 'paid'],
      required: true,
      default: 'free',
    },
    duration: {
      type: String, // e.g., "2 hours", "1 day"
    },
    organizer: {
      type: String,
    },
    tags: [{
      type: String,
    }],
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);