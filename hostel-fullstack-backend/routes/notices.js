const express = require('express');
const router  = express.Router();
const Notice  = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/notices
router.get('/', protect, async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json({ success: true, data: notices });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/notices — manager creates notice
router.post('/', protect, authorize(...mgr), async (req, res) => {
    try {
        const { title, content, type, priority } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: 'title and content are required' });
        const notice = await Notice.create({
            title, content, type, priority,
            date: new Date().toISOString().split('T')[0],
        });
        res.status(201).json({ success: true, data: notice });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/notices/:id
router.delete('/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notice deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
