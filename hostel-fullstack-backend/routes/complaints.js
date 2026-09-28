const express   = require('express');
const router    = express.Router();
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/complaints
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: complaints });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/complaints — student submits
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
        const { type, description } = req.body;
        if (!type || !description) return res.status(400).json({ success: false, message: 'type and description are required' });
        const complaint = await Complaint.create({
            studentId: req.user.studentId,
            studentName: req.user.name,
            room: req.user.room || 'N/A',
            type, description,
        });
        res.status(201).json({ success: true, data: complaint });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/complaints/:id/status — manager updates status
router.patch('/:id/status', protect, authorize(...mgr), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const update = { status };
        if (status === 'resolved') update.resolvedDate = new Date();
        if (status === 'rejected') update.rejectionReason = rejectionReason || null;
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
        res.json({ success: true, data: complaint });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/complaints/:id
router.delete('/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Complaint deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
