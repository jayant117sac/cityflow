const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/adminController');

router.use(protect);
router.use(restrictTo('dept_head', 'super_admin'));

router.get('/analytics', getAnalytics);

module.exports = router;