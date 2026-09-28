const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    studentId:       { type: String, required: true },
    studentName:     { type: String, required: true },
    room:            { type: String },
    type:            { type: String, required: true },
    description:     { type: String, required: true },
    status:          { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: null },
    resolvedDate:    { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
