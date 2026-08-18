const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const {
  registerForEvent,
  cancelRegistration,
  getEventAttendees,
  getEventStatus
} = require('../controllers/registrationController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// مسارات الـ CRUD العادية للأحداث
router.route('/')
  .get(getEvents)
  .post(requireAuth, requireRole('admin'), createEvent);

// مسارات التسجيل وإدارة السعة (Task 4 Endpoints)
router.route('/:id/register')
  .post(requireAuth, registerForEvent)
  .delete(requireAuth, cancelRegistration);

router.get('/:id/attendees', getEventAttendees);
router.get('/:id/status', getEventStatus);

// مسارات تفاصيل الحدث الفردي
router.route('/:id')
  .get(getEventById)
  .put(requireAuth, updateEvent)
  .delete(requireAuth, deleteEvent);

module.exports = router;