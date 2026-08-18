const Registration = require('../models/Registration');
const Event = require('../models/Event');

// 1. Register for an event
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered (Duplicate Prevention)
    const existingReg = await Registration.findOne({ user: userId, event: eventId });
    if (existingReg) {
      return res.status(400).json({ message: 'Already registered' });
    }

    // Check capacity enforcement (Event is full check)
    const currentRegistrations = await Registration.countDocuments({ event: eventId, status: 'registered' });
    if (currentRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Create registration
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      status: 'registered'
    });

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const registration = await Registration.findOneAndDelete({
      event: eventId,
      user: userId
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. List registered attendees
exports.getEventAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;
    const registrations = await Registration.find({ event: eventId, status: 'registered' })
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Show seats left / capacity info
exports.getEventStatus = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registeredCount = await Registration.countDocuments({ event: eventId, status: 'registered' });
    const seatsLeft = event.capacity - registeredCount;

    res.status(200).json({
      success: true,
      capacity: event.capacity,
      registered: registeredCount,
      seatsLeft: seatsLeft > 0 ? seatsLeft : 0,
      isFull: registeredCount >= event.capacity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};