const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCategories)
    .post(requireAuth, requireRole('admin'), createCategory);

module.exports = router;