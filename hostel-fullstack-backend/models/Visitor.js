const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    studentId:       { type: String, required: true },
    studentName:     { type: String, required: true },
    studentRoom:     { type: String },
    hostel:          { type: String },
    visitorName:     { type: String, required: true },
    relation:        { type: String, required: true },
    phone:           { type: String, required: true },
    purpose:         { type: String, required: true },
    visitDate:       { type: String, required: true },
    visitTime:       { type: String, required: true },
    details:         { type: String },
    status:          { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestDate:     { type: String },
    approvedDate:    { type: String, default: null },
    rejectionReason: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
