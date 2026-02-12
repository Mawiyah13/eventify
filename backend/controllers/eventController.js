import Event from "../models/Event.js";

/* =======================
   GET ALL EVENTS
   ======================= */
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
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
    const event = await Event.findById(req.params.id);
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
    const { title, description, capacity, location, date, image } = req.body;

    const event = await Event.create({
      title,
      description,
      capacity,
      location,
      date,
      image,
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
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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

    res.json({ message: "Successfully registered for event" });
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
export const unregisterFromEvent = async (req, res) => {
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
