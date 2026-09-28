const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId:   { type: String, required: true },
    studentName: { type: String, required: true },
    room:        { type: String },
    date:        { type: String, required: true }, // YYYY-MM-DD
    time:        { type: String, required: true },
    status:      { type: String, enum: ['present', 'absent'], default: 'present' },
    latitude:    { type: Number },
    longitude:   { type: Number },
    location:    { type: String },
}, { timestamps: true });

// One record per student per day
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
