const mongoose = require('mongoose');

const MessScheduleSchema = new mongoose.Schema({
    day:       { type: String, required: true, unique: true },
    breakfast: { type: String, required: true },
    lunch:     { type: String, required: true },
    dinner:    { type: String, required: true },
}, { timestamps: true });

const MessFeedbackSchema = new mongoose.Schema({
    studentId:   { type: String, required: true },
    studentName: { type: String, required: true },
    date:        { type: String, required: true },
    day:         { type: String, required: true },
    breakfast:   { type: Number, min: 1, max: 5 },
    lunch:       { type: Number, min: 1, max: 5 },
    dinner:      { type: Number, min: 1, max: 5 },
    comment:     { type: String, default: '' },
}, { timestamps: true });

module.exports = {
    MessSchedule: mongoose.model('MessSchedule', MessScheduleSchema),
    MessFeedback: mongoose.model('MessFeedback', MessFeedbackSchema),
};
