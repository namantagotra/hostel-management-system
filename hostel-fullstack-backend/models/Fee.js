const mongoose = require('mongoose');

const FeePaymentSchema = new mongoose.Schema({
    studentId:     { type: String, required: true },
    studentName:   { type: String, required: true },
    room:          { type: String },
    hostel:        { type: String },
    feeType:       { type: String, required: true },
    amount:        { type: Number, required: true },
    paymentMode:   { type: String, required: true },
    transactionId: { type: String },
    paymentDate:   { type: String, required: true },
    notes:         { type: String },
    proofUrl:      { type: String },       // Cloudinary URL
    proofPublicId: { type: String },       // Cloudinary public_id (for deletion)
    proofType:     { type: String, enum: ['image', 'pdf'] },
    proofName:     { type: String },
    status:        { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedAt:    { type: Date, default: null },
    verifiedBy:    { type: String, default: null }, // manager name
    rejectionReason: { type: String, default: null },
}, { timestamps: true });

const FeeStructureSchema = new mongoose.Schema({
    label:  { type: String, required: true },
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = {
    FeePayment:   mongoose.model('FeePayment', FeePaymentSchema),
    FeeStructure: mongoose.model('FeeStructure', FeeStructureSchema),
};
