// Run with: node seed.js
require('dotenv').config();
const connectDB  = require('./config/db');

const User               = require('./models/User');
const Room               = require('./models/Room');
const Complaint          = require('./models/Complaint');
const Outpass            = require('./models/Outpass');
const Attendance         = require('./models/Attendance');
const Notice             = require('./models/Notice');
const RoomChange         = require('./models/RoomChange');
const Visitor            = require('./models/Visitor');
const { MessSchedule, MessFeedback } = require('./models/Mess');
const { FeeStructure }   = require('./models/Fee');

const seed = async () => {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clear all collections
    await Promise.all([
        User.deleteMany(), Room.deleteMany(), Complaint.deleteMany(),
        Outpass.deleteMany(), Attendance.deleteMany(), Notice.deleteMany(),
        RoomChange.deleteMany(), Visitor.deleteMany(),
        MessSchedule.deleteMany(), MessFeedback.deleteMany(),
        FeeStructure.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users — save one by one so pre('save') hook hashes passwords ──
    const usersData = [
        { name: 'Super Admin',    email: 'superadmin@college.edu', password: 'superadmin123', role: 'super_admin' },
        { name: 'Hostel Manager', email: 'manager@college.edu',    password: 'manager123',    role: 'hostel_manager', managedHostel: 'Boys Hostel A', phone: '+91 9000000001' },
        { name: 'John Smith',     email: 'john@college.edu',       password: 'student123',    role: 'student', studentId: 'CS2024001', department: 'Computer Science', year: '3rd', room: '102', hostel: 'Boys Hostel A', phone: '+1234567890' },
        { name: 'Sarah Johnson',  email: 'sarah@college.edu',      password: 'student123',    role: 'student', studentId: 'EE2024002', department: 'Electrical Eng',   year: '2nd', room: '201', hostel: 'Girls Hostel B', phone: '+1234567891' },
        { name: 'Mike Brown',     email: 'mike@college.edu',       password: 'student123',    role: 'student', studentId: 'ME2024003', department: 'Mechanical Eng',   year: '4th', phone: '+1234567892' },
        { name: 'Emma Davis',     email: 'emma@college.edu',       password: 'student123',    role: 'student', studentId: 'CS2024004', department: 'Computer Science', year: '1st', phone: '+1234567893' },
    ];
    for (const u of usersData) {
        await new User(u).save();
    }
    console.log('✅ Users seeded');

    // ── Rooms ──────────────────────────────────────────────────────────
    await Room.create([
        { number: '101', type: 'Single', capacity: 1, price: 5000, status: 'available',   floor: 1, hostel: 'Boys Hostel A',  assignedTo: null },
        { number: '102', type: 'Double', capacity: 2, price: 4000, status: 'occupied',    floor: 1, hostel: 'Boys Hostel A',  assignedTo: 'CS2024001' },
        { number: '103', type: 'Triple', capacity: 3, price: 3500, status: 'available',   floor: 1, hostel: 'Boys Hostel A',  assignedTo: null },
        { number: '201', type: 'Double', capacity: 2, price: 4000, status: 'occupied',    floor: 2, hostel: 'Girls Hostel B', assignedTo: 'EE2024002' },
        { number: '202', type: 'Single', capacity: 1, price: 5000, status: 'maintenance', floor: 2, hostel: 'Girls Hostel B', assignedTo: null },
        { number: '203', type: 'Double', capacity: 2, price: 4000, status: 'available',   floor: 2, hostel: 'Girls Hostel B', assignedTo: null },
    ]);
    console.log('✅ Rooms seeded');

    // ── Mess Schedule ──────────────────────────────────────────────────
    await MessSchedule.create([
        { day: 'Monday',    breakfast: 'Idli, Sambar, Chutney',   lunch: 'Rice, Dal, Roti, Mixed Veg',    dinner: 'Chapati, Paneer Curry, Dal' },
        { day: 'Tuesday',   breakfast: 'Poha, Tea/Coffee',         lunch: 'Rice, Sambar, Curd, Vegetable', dinner: 'Rice, Rajma, Salad' },
        { day: 'Wednesday', breakfast: 'Upma, Chutney',            lunch: 'Rice, Rasam, Cabbage Fry',      dinner: 'Roti, Aloo Gobi, Dal' },
        { day: 'Thursday',  breakfast: 'Dosa, Sambar, Chutney',   lunch: 'Rice, Dal, Bhindi Masala',      dinner: 'Chapati, Chole, Rice' },
        { day: 'Friday',    breakfast: 'Paratha, Curd',            lunch: 'Biryani, Raita, Boiled Egg',    dinner: 'Roti, Dal Fry, Aloo Matar' },
        { day: 'Saturday',  breakfast: 'Bread, Omelette, Jam',    lunch: 'Rice, Kadhi, Papad',            dinner: 'Fried Rice, Manchurian' },
        { day: 'Sunday',    breakfast: 'Puri, Aloo Curry',         lunch: 'Special Thali',                 dinner: 'Roti, Paneer Butter Masala' },
    ]);
    console.log('✅ Mess schedule seeded');

    // ── Notices ────────────────────────────────────────────────────────
    await Notice.create([
        { title: 'Hostel Fest 2026',          content: 'Annual hostel fest on March 15th. All students are invited.', type: 'event',       priority: 'high',   date: '2026-02-20' },
        { title: 'Water Supply Interruption', content: 'Water supply interrupted Feb 28th 10AM-2PM for maintenance.', type: 'maintenance', priority: 'high',   date: '2026-02-22' },
        { title: 'New Mess Timings',          content: 'From March 1st: Breakfast 7-9AM, Lunch 12-2PM, Dinner 7-9PM.', type: 'general',   priority: 'medium', date: '2026-02-18' },
    ]);
    console.log('✅ Notices seeded');

    // ── Fee Structures ─────────────────────────────────────────────────
    await Attendance.create([
        {
            studentId: 'CS2024001',
            studentName: 'John Smith',
            room: '102',
            date: '2026-04-17',
            time: '07:58:12',
            status: 'present',
            latitude: 12.9716,
            longitude: 77.5946,
            location: 'Boys Hostel A Gate',
        },
        {
            studentId: 'CS2024001',
            studentName: 'John Smith',
            room: '102',
            date: '2026-04-18',
            time: '08:04:30',
            status: 'present',
            latitude: 12.9717,
            longitude: 77.5947,
            location: 'Boys Hostel A Lobby',
        },
        {
            studentId: 'EE2024002',
            studentName: 'Sarah Johnson',
            room: '201',
            date: '2026-04-18',
            time: '08:11:09',
            status: 'present',
            latitude: 12.9721,
            longitude: 77.5951,
            location: 'Girls Hostel B Entrance',
        },
        {
            studentId: 'EE2024002',
            studentName: 'Sarah Johnson',
            room: '201',
            date: '2026-04-19',
            time: '08:06:44',
            status: 'present',
            latitude: 12.9722,
            longitude: 77.5952,
            location: 'Girls Hostel B Reception',
        },
        {
            studentId: 'ME2024003',
            studentName: 'Mike Brown',
            room: null,
            date: '2026-04-19',
            time: '08:20:15',
            status: 'absent',
            latitude: 12.9709,
            longitude: 77.5939,
            location: 'Campus Block C',
        },
        {
            studentId: 'CS2024004',
            studentName: 'Emma Davis',
            room: null,
            date: '2026-04-20',
            time: '08:02:51',
            status: 'present',
            latitude: 12.9712,
            longitude: 77.5942,
            location: 'Hostel Office',
        },
    ]);
    console.log('âœ… Attendance seeded');

    await FeeStructure.create([
        { label: 'Hostel Fee',       amount: 15000 },
        { label: 'Mess Fee',         amount: 4500  },
        { label: 'Security Deposit', amount: 5000  },
    ]);
    console.log('✅ Fee structures seeded');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Demo Logins:');
    console.log('  Super Admin  → superadmin@college.edu / superadmin123');
    console.log('  Manager      → manager@college.edu    / manager123');
    console.log('  Student      → john@college.edu       / student123');
    process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
