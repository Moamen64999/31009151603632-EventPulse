const Event = require('../models/Event');

// 1. Create Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, city, capacity, category } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      city,
      capacity,
      category,
      user: req.user._id // تم التقاطه من الـ auth middleware
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Events (with Filters, Search, and Pagination)
exports.getEvents = async (req, res) => {
  try {
    let queryObj = { ...req.query };
    
    // استبعاد الكلمات الخاصة بالـ query للتصفية البحتة
    const excludedFields = ['page', 'sort', 'limit', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    let query = Event.find(JSON.parse(queryStr))
      .populate('category', 'name')
      .populate('user', 'name email');

    // البحث النصي (Search by title or description)
    if (req.query.search) {
      query = query.find({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // الفرز (Sorting)
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // التقسيم لصفحات (Pagination)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const events = await query;
    const total = await Event.countDocuments();

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      data: events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Single Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('category', 'name')
      .populate('user', 'name email');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Event
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // التحقق أن المستخدم هو صاحب الحدث أو أدمن
    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // التحقق أن المستخدم هو صاحب الحدث أو أدمن
    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};