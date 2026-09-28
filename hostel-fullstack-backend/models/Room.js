const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    number:     { type: String, required: true, unique: true },
    type:       { type: String, enum: ['Single', 'Double', 'Triple'], required: true },
    capacity:   { type: Number, required: true },
    price:      { type: Number, required: true },
    floor:      { type: Number, required: true },
    hostel:     { type: String, required: true },
    status:     { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    assignedTo: { type: String, default: null }, // studentId
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
