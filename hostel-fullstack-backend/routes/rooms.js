const express = require('express');
const router  = express.Router();
const Room    = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/rooms
router.get('/', protect, async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json({ success: true, data: rooms });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/rooms
router.post('/', protect, authorize(...mgr), async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/rooms/:id
router.patch('/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.json({ success: true, data: room });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/rooms/:id
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.json({ success: true, message: 'Room deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
