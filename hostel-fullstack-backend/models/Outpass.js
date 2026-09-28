const mongoose = require('mongoose');

const OutpassSchema = new mongoose.Schema({
    studentId:       { type: String, required: true },
    studentName:     { type: String, required: true },
    room:            { type: String },
    reason:          { type: String, required: true },
    fromDate:        { type: Date, required: true },
    toDate:          { type: Date, required: true },
    status:          { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: null },
    rejectedDate:    { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Outpass', OutpassSchema);
