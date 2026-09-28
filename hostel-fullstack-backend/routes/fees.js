const express = require('express');
const router  = express.Router();
const { FeePayment, FeeStructure } = require('../models/Fee');
const { upload, cloudinary } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

const mgr = ['hostel_manager', 'super_admin'];

// ── Fee Structure ─────────────────────────────────────

// GET /api/fees/structure
router.get('/structure', protect, async (req, res) => {
    try {
        const structures = await FeeStructure.find();
        res.json({ success: true, data: structures });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/fees/structure — manager adds fee type
router.post('/structure', protect, authorize(...mgr), async (req, res) => {
    try {
        const { label, amount } = req.body;
        if (!label || !amount) return res.status(400).json({ success: false, message: 'label and amount required' });
        const structure = await FeeStructure.create({ label, amount });
        res.status(201).json({ success: true, data: structure });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/fees/structure/:id
router.delete('/structure/:id', protect, authorize(...mgr), async (req, res) => {
    try {
        await FeeStructure.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Fee structure deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Fee Payments ──────────────────────────────────────

// GET /api/fees/payments
router.get('/payments', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'student' ? { studentId: req.user.studentId } : {};
        const payments = await FeePayment.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/fees/payments — student submits with proof upload
router.post('/payments', protect, authorize('student'), upload.single('proof'), async (req, res) => {
    try {
        const { feeType, amount, paymentMode, transactionId, paymentDate, notes } = req.body;
        if (!feeType || !amount || !paymentMode || !paymentDate)
            return res.status(400).json({ success: false, message: 'feeType, amount, paymentMode, paymentDate are required' });
        if (!req.file)
            return res.status(400).json({ success: false, message: 'Payment proof file is required' });

        const isImage    = req.file.mimetype.startsWith('image/');
        const payment    = await FeePayment.create({
            studentId:     req.user.studentId,
            studentName:   req.user.name,
            room:          req.user.room || 'N/A',
            hostel:        req.user.hostel || 'N/A',
            feeType, amount: Number(amount),
            paymentMode, transactionId, paymentDate, notes,
            proofUrl:      req.file.path,        // Cloudinary URL
            proofPublicId: req.file.filename,    // Cloudinary public_id
            proofType:     isImage ? 'image' : 'pdf',
            proofName:     req.file.originalname,
        });
        res.status(201).json({ success: true, data: payment });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/fees/payments/:id/verify — manager verifies
router.patch('/payments/:id/verify', protect, authorize(...mgr), async (req, res) => {
    try {
        const payment = await FeePayment.findByIdAndUpdate(req.params.id, {
            status: 'verified',
            verifiedAt: new Date(),
            verifiedBy: req.user.name,
            rejectionReason: null,
        }, { new: true });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.json({ success: true, data: payment });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/fees/payments/:id/reject — manager rejects
router.patch('/payments/:id/reject', protect, authorize(...mgr), async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        if (!rejectionReason) return res.status(400).json({ success: false, message: 'rejectionReason is required' });
        const payment = await FeePayment.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            rejectionReason,
            verifiedAt: new Date(),
            verifiedBy: req.user.name,
        }, { new: true });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.json({ success: true, data: payment });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
