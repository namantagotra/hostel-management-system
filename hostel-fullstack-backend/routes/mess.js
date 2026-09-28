const express = require('express');
const router  = express.Router();
const { MessSchedule, MessFeedback } = require('../models/Mess');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// ── Schedule ──────────────────────────────────────────

// GET /api/mess/schedule
router.get('/schedule', protect, async (req, res) => {
    try {
        const schedule = await MessSchedule.find();
        res.json({ success: true, data: schedule });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/mess/schedule/:id — manager updates a day's menu
router.patch('/schedule/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        const day = await MessSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!day) return res.status(404).json({ success: false, message: 'Day not found' });
        res.json({ success: true, data: day });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Feedback ──────────────────────────────────────────

// GET /api/mess/feedback
router.get('/feedback', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const feedback = await MessFeedback.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: feedback });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/mess/feedback — student submits feedback
router.post('/feedback', protect, authorize('student'), async (req, res) => {
    try {
        const { day, breakfast, lunch, dinner, comment } = req.body;
        const date = new Date().toISOString().split('T')[0];

        // One feedback per student per day
        const existing = await MessFeedback.findOne({ studentId: req.user.studentId, date });
        if (existing) return res.status(400).json({ success: false, message: 'Already submitted feedback for today' });

        const feedback = await MessFeedback.create({
            studentId: req.user.studentId,
            studentName: req.user.name,
            date, day, breakfast, lunch, dinner, comment,
        });
        res.status(201).json({ success: true, data: feedback });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
