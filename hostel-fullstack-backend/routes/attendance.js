const express    = require('express');
const router     = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/attendance
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const records = await Attendance.find(filter).sort({ date: -1 });
        res.json({ success: true, data: records });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/attendance — student marks attendance
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
        const { latitude, longitude, location } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const time  = new Date().toTimeString().split(' ')[0];

        // Check already marked today
        const existing = await Attendance.findOne({ studentId: req.user.studentId, date: today });
        if (existing) return res.status(400).json({ success: false, message: 'Already marked for today' });

        const record = await Attendance.create({
            studentId:   req.user.studentId,
            studentName: req.user.name,
            room:        req.user.room,
            date: today, time, status: 'present',
            latitude, longitude, location,
        });
        res.status(201).json({ success: true, data: record });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/attendance/:id — manager can remove a record
router.delete('/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
