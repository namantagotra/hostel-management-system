const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Room    = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/students/me — student fetches own latest record
router.get('/me', protect, async (req, res) => {
    try {
        const student = await User.findById(req.user._id).select('-password');
        res.json({ success: true, data: student });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/students — all authenticated users can call
router.get('/', protect, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json({ success: true, data: students });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/students — register (manager/admin only)
router.post('/', protect, authorize(...mgr), async (req, res) => {
    try {
        const { name, email, studentId, department, year, phone, password } = req.body;
        if (!name || !email || !studentId || !password)
            return res.status(400).json({ success: false, message: 'name, email, studentId and password are required' });
        if (await User.findOne({ email: email.toLowerCase() }))
            return res.status(400).json({ success: false, message: 'Email already exists' });
        if (await User.findOne({ studentId }))
            return res.status(400).json({ success: false, message: 'Student ID already exists' });

        // new + save so pre('save') hook hashes password exactly once
        const student = await new User({ name, email, studentId, department, year, phone, password, role: 'student' }).save();
        const s = student.toObject(); delete s.password;
        res.status(201).json({ success: true, data: s });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/students/:id/allocate
router.patch('/:id/allocate', protect, authorize(...mgr), async (req, res) => {
    try {
        const { roomNumber } = req.body;
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        const newRoom = await Room.findOne({ number: roomNumber });
        if (!newRoom) return res.status(404).json({ success: false, message: 'Room not found' });
        if (newRoom.status !== 'available' && newRoom.assignedTo !== student.studentId)
            return res.status(400).json({ success: false, message: 'Room is not available' });
        if (student.room) await Room.findOneAndUpdate({ number: student.room }, { status: 'available', assignedTo: null });
        await Room.findOneAndUpdate({ number: roomNumber }, { status: 'occupied', assignedTo: student.studentId });
        const updated = await User.findByIdAndUpdate(req.params.id, { room: roomNumber, hostel: newRoom.hostel }, { new: true }).select('-password');
        res.json({ success: true, data: updated });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/students/:id/deallocate
router.patch('/:id/deallocate', protect, authorize(...mgr), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        if (student.room) await Room.findOneAndUpdate({ number: student.room }, { status: 'available', assignedTo: null });
        const updated = await User.findByIdAndUpdate(req.params.id, { room: null, hostel: null }, { new: true }).select('-password');
        res.json({ success: true, data: updated });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/students/:id — manager AND super_admin can delete
router.delete('/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        if (student.role !== 'student') return res.status(400).json({ success: false, message: 'Can only delete student accounts' });
        // Free their room if assigned
        if (student.room) await Room.findOneAndUpdate({ number: student.room }, { status: 'available', assignedTo: null });
        await student.deleteOne();
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
