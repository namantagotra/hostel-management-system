const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/managers
router.get('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const managers = await User.find({ role: 'hostel_manager' }).select('-password');
        res.json({ success: true, data: managers });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/managers — super admin creates manager
router.post('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { name, email, password, phone, managedHostel } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email and password required' });
        if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ success: false, message: 'Email already exists' });

        const manager = await User.create({ name, email, password, phone, managedHostel, role: 'hostel_manager' });
        const m = manager.toObject(); delete m.password;
        res.status(201).json({ success: true, data: m });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/managers/:id
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Manager deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
