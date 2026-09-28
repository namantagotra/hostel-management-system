const mongoose = require('mongoose');

const HostelApplicationSchema = new mongoose.Schema({
    name:              { type: String, required: true },
    email:             { type: String, required: true },
    password:          { type: String, required: true }, // hashed
    phone:             { type: String },
    studentId:         { type: String, required: true },
    department:        { type: String, required: true },
    year:              { type: String },
    gender:            { type: String, required: true },
    preferredHostel:   { type: String },
    preferredRoomType: { type: String },
    reason:            { type: String },
    status:            { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedDate:       { type: String },
    allottedRoom:      { type: String, default: null },
    allottedHostel:    { type: String, default: null },
    rejectionReason:   { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('HostelApplication', HostelApplicationSchema);
