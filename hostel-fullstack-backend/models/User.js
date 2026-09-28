const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true, minlength: 6, select: false },
    role:       { type: String, enum: ['student', 'hostel_manager', 'super_admin'], default: 'student' },
    studentId:  { type: String, sparse: true, unique: true },
    phone:      { type: String },
    department: { type: String },
    year:       { type: String },
    gender:     { type: String },
    room:       { type: String, default: null },
    hostel:     { type: String, default: null },
    // Manager specific
    managedHostel: { type: String },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare entered password with hashed
UserSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
