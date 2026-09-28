const express  = require('express');
const router   = express.Router();
const Visitor  = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/visitors
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const visitors = await Visitor.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: visitors });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/visitors — student requests visitor entry
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
        const { visitorName, relation, phone, purpose, visitDate, visitTime, details } = req.body;
        if (!visitorName || !relation || !phone || !purpose || !visitDate || !visitTime)
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });

        const visitor = await Visitor.create({
            studentId: req.user.studentId,
            studentName: req.user.name,
            studentRoom: req.user.room,
            hostel: req.user.hostel,
            visitorName, relation, phone, purpose,
            visitDate, visitTime, details,
            requestDate: new Date().toISOString().split('T')[0],
        });
        res.status(201).json({ success: true, data: visitor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/visitors/:id/status — manager approves/rejects
router.patch('/:id/status', protect, authorize(...mgr), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const update = { status };
        if (status === 'approved') update.approvedDate = new Date().toISOString().split('T')[0];
        if (status === 'rejected') update.rejectionReason = rejectionReason || null;
        const visitor = await Visitor.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!visitor) return res.status(404).json({ success: false, message: 'Visitor request not found' });
        res.json({ success: true, data: visitor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
