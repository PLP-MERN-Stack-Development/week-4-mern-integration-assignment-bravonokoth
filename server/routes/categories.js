const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllCategories);
router.post('/', protect, admin, createCategory);

module.exports = router;