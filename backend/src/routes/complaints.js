const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', ctrl.getComplaints);
router.post('/', ctrl.createComplaint);
router.get('/:id', ctrl.getComplaintById);
router.patch('/:id/status', restrictTo('field_officer', 'dept_head', 'super_admin'), ctrl.updateStatus);
router.patch('/:id/assign', restrictTo('dept_head', 'super_admin'), ctrl.assignComplaint);

module.exports = router;