const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title:    { type: String, required: true },
    content:  { type: String, required: true },
    type:     { type: String, enum: ['event', 'maintenance', 'general'], default: 'general' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    date:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);
