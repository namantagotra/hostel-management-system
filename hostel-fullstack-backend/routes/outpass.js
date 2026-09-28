const express  = require('express');
const router   = express.Router();
const Outpass  = require('../models/Outpass');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/outpasses
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const outpasses = await Outpass.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: outpasses });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/outpasses — student requests outpass
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
        const { reason, fromDate, toDate } = req.body;
        if (!reason || !fromDate || !toDate) return res.status(400).json({ success: false, message: 'reason, fromDate and toDate are required' });
        const outpass = await Outpass.create({
            studentId: req.user.studentId,
            studentName: req.user.name,
            room: req.user.room || null,
            reason, fromDate, toDate,
        });
        res.status(201).json({ success: true, data: outpass });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/outpasses/:id/status — manager approves/rejects
router.patch('/:id/status', protect, authorize(...mgr), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const update = { status };
        if (status === 'rejected') {
            update.rejectionReason = rejectionReason || null;
            update.rejectedDate = new Date();
        }
        const outpass = await Outpass.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!outpass) return res.status(404).json({ success: false, message: 'Outpass not found' });
        res.json({ success: true, data: outpass });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
