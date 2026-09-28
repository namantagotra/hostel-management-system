const mongoose = require('mongoose');

const RoomChangeSchema = new mongoose.Schema({
    studentId:       { type: String, required: true },
    studentName:     { type: String, required: true },
    currentRoom:     { type: String },
    currentHostel:   { type: String },
    preferredRoom:   { type: String },
    reason:          { type: String, required: true },
    details:         { type: String },
    status:          { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedRoom:    { type: String, default: null },
    approvedHostel:  { type: String, default: null },
    rejectionReason: { type: String, default: null },
    date:            { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RoomChange', RoomChangeSchema);
