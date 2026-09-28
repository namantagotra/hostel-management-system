const express           = require('express');
const router            = express.Router();
const bcrypt            = require('bcryptjs');
const HostelApplication = require('../models/HostelApplication');
const User              = require('../models/User');
const Room              = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// GET /api/applications — managers see all, applicant sees own
router.get('/', protect, async (req, res) => {
    try {
        const isManager = mgr.includes(req.user.role);
        const filter = isManager ? {} : { email: req.user.email };
        const apps = await HostelApplication.find(filter).sort({ createdAt: -1 });
        // strip passwords before sending
        const safe = apps.map(a => { const o = a.toObject(); delete o.password; return o; });
        res.json({ success: true, data: safe });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/applications — public, no auth needed
router.post('/', async (req, res) => {
    try {
        const { name, email, password, phone, studentId, department, year, gender, preferredHostel, preferredRoomType, reason } = req.body;
        if (!name || !email || !password || !studentId || !gender || !department)
            return res.status(400).json({ success: false, message: 'Required fields missing' });

        const existing = await HostelApplication.findOne({ studentId, status: 'pending' });
        if (existing) return res.status(400).json({ success: false, message: 'Already has a pending application' });

        const alreadyStudent = await User.findOne({ studentId });
        if (alreadyStudent) return res.status(400).json({ success: false, message: 'Student already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const app = await HostelApplication.create({
            name, email, password: hashed,
            phone, studentId, department, year, gender,
            preferredHostel, preferredRoomType, reason,
            appliedDate: new Date().toISOString().split('T')[0],
        });

        const result = app.toObject(); delete result.password;
        res.status(201).json({ success: true, data: result });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/applications/:id/approve — manager approves + creates student account
router.patch('/:id/approve', protect, authorize(...mgr), async (req, res) => {
    try {
        const { roomNumber } = req.body;
        const app = await HostelApplication.findById(req.params.id);
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        const room = await Room.findOne({ number: roomNumber });
        if (!room || room.status !== 'available')
            return res.status(400).json({ success: false, message: 'Room not available' });

        // Check student account doesn't already exist
        const existing = await User.findOne({ email: app.email });
        if (existing) {
            // Already created — just update application status
            await HostelApplication.findByIdAndUpdate(req.params.id, {
                status: 'approved', allottedRoom: roomNumber, allottedHostel: room.hostel,
            });
            await Room.findOneAndUpdate({ number: roomNumber }, { status: 'occupied', assignedTo: app.studentId });
            return res.json({ success: true, message: 'Application approved (account already exists)' });
        }

        // Create student account — password is already bcrypt hashed in HostelApplication
        // We bypass pre('save') hook by using insertOne to avoid double-hashing
        await User.collection.insertOne({
            name:       app.name,
            email:      app.email.toLowerCase(),
            password:   app.password,   // already hashed — insert directly
            studentId:  app.studentId,
            department: app.department,
            year:       app.year,
            gender:     app.gender,
            phone:      app.phone,
            room:       roomNumber,
            hostel:     room.hostel,
            role:       'student',
            createdAt:  new Date(),
            updatedAt:  new Date(),
        });

        // Mark room occupied
        await Room.findOneAndUpdate({ number: roomNumber }, { status: 'occupied', assignedTo: app.studentId });

        // Update application
        await HostelApplication.findByIdAndUpdate(req.params.id, {
            status: 'approved', allottedRoom: roomNumber, allottedHostel: room.hostel,
        });

        res.json({ success: true, message: 'Approved. Student account created.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/applications/:id/reject
router.patch('/:id/reject', protect, authorize(...mgr), async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const app = await HostelApplication.findByIdAndUpdate(req.params.id, {
            status: 'rejected', rejectionReason: rejectionReason || 'Application rejected',
        }, { new: true });
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
        const result = app.toObject(); delete result.password;
        res.json({ success: true, data: result });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
