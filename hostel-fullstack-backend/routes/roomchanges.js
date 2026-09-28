const express    = require('express');
const router     = express.Router();
const RoomChange = require('../models/RoomChange');
const Room       = require('../models/Room');
const User       = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/roomchanges
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const changes = await RoomChange.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: changes });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/roomchanges — student requests room change
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
        const { reason, preferredRoom, details } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'reason is required' });
        const change = await RoomChange.create({
            studentId: req.user.studentId,
            studentName: req.user.name,
            currentRoom: req.user.room,
            currentHostel: req.user.hostel,
            preferredRoom: preferredRoom || 'Any available',
            reason, details,
            date: new Date().toISOString().split('T')[0],
        });
        res.status(201).json({ success: true, data: change });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/roomchanges/:id/status — manager approves/rejects
router.patch('/:id/status', protect, authorize(...mgr), async (req, res) => {
    try {
        const { status, rejectionReason, approvedRoom, approvedHostel } = req.body;
        const update = { status };

        if (status === 'approved' && approvedRoom) {
            update.approvedRoom   = approvedRoom;
            update.approvedHostel = approvedHostel;

            // Actually move the student
            const change  = await RoomChange.findById(req.params.id);
            const student = await User.findOne({ studentId: change.studentId });
            if (student) {
                if (student.room) await Room.findOneAndUpdate({ number: student.room }, { status: 'available', assignedTo: null });
                await Room.findOneAndUpdate({ number: approvedRoom }, { status: 'occupied', assignedTo: student.studentId });
                await User.findByIdAndUpdate(student._id, { room: approvedRoom, hostel: approvedHostel });
            }
        }
        if (status === 'rejected') update.rejectionReason = rejectionReason || null;

        const change = await RoomChange.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!change) return res.status(404).json({ success: false, message: 'Request not found' });
        res.json({ success: true, data: change });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
