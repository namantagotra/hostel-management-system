const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const router   = express.Router();
const User     = require('../models/User');
const HostelApplication = require('../models/HostelApplication');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    try {
        // ── Step 1: Try regular User account (student/manager/admin) ──
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (user) {
            const match = await user.matchPassword(password);
            if (match) {
                const token = signToken(user._id);
                const userObj = user.toObject(); delete userObj.password;
                return res.json({ success: true, token, user: { ...userObj, role: user.role } });
            }
            // Wrong password for existing user
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // ── Step 2: Try HostelApplication (applicant login) ──
        const app = await HostelApplication.findOne({ email: email.toLowerCase() });
        if (app) {
            const match = await bcrypt.compare(password, app.password);
            if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

            // If application is approved, a student account now exists — log them in as student
            const studentAccount = await User.findOne({ email: email.toLowerCase() }).select('+password');
            if (studentAccount) {
                const token = signToken(studentAccount._id);
                const userObj = studentAccount.toObject(); delete userObj.password;
                return res.json({ success: true, token, user: { ...userObj, role: 'student' } });
            }

            // Still pending/rejected — log in as applicant
            const token = signToken(app._id);
            const appObj = app.toObject(); delete appObj.password;
            return res.json({ success: true, token, user: { ...appObj, role: 'applicant' } });
        }

        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
