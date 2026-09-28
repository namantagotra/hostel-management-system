// Rooms
export const rooms = [
    { id: 1, number: '101', type: 'Single', capacity: 1, price: 5000, status: 'available', floor: 1, hostel: 'Boys Hostel A', assignedTo: null },
    { id: 2, number: '102', type: 'Double', capacity: 2, price: 4000, status: 'occupied', floor: 1, hostel: 'Boys Hostel A', assignedTo: 'CS2024001' },
    { id: 3, number: '103', type: 'Triple', capacity: 3, price: 3500, status: 'available', floor: 1, hostel: 'Boys Hostel A', assignedTo: null },
    { id: 4, number: '201', type: 'Double', capacity: 2, price: 4000, status: 'occupied', floor: 2, hostel: 'Girls Hostel B', assignedTo: 'EE2024002' },
    { id: 5, number: '202', type: 'Single', capacity: 1, price: 5000, status: 'maintenance', floor: 2, hostel: 'Girls Hostel B', assignedTo: null },
    { id: 6, number: '203', type: 'Double', capacity: 2, price: 4000, status: 'available', floor: 2, hostel: 'Girls Hostel B', assignedTo: null },
];

// Students
export const students = [
    { id: 1, name: 'John Smith', email: 'john@college.edu', studentId: 'CS2024001', department: 'Computer Science', year: '3rd', room: '102', hostel: 'Boys Hostel A', password: 'student123', phone: '+1234567890' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@college.edu', studentId: 'EE2024002', department: 'Electrical Eng', year: '2nd', room: '201', hostel: 'Girls Hostel B', password: 'student123', phone: '+1234567891' },
    { id: 3, name: 'Mike Brown', email: 'mike@college.edu', studentId: 'ME2024003', department: 'Mechanical Eng', year: '4th', room: null, hostel: null, password: 'student123', phone: '+1234567892' },
    { id: 4, name: 'Emma Davis', email: 'emma@college.edu', studentId: 'CS2024004', department: 'Computer Science', year: '1st', room: null, hostel: null, password: 'student123', phone: '+1234567893' },
];

// Super Admin (can manage hostel managers, view all student data)
export const superAdmin = {
    id: 0,
    name: 'Super Admin',
    email: 'superadmin@college.edu',
    password: 'superadmin123',
    role: 'super_admin'
};

// Hostel Managers (formerly "admin")
export const hostelManagers = [
    {
        id: 1,
        name: 'Hostel Manager',
        email: 'manager@college.edu',
        password: 'manager123',
        role: 'hostel_manager',
        hostel: 'Boys Hostel A',
        phone: '+91 9000000001',
        createdAt: '2026-01-01'
    }
];

// Complaints
export const complaints = [
    { id: 1, studentId: 'CS2024001', studentName: 'John Smith', room: '102', type: 'Maintenance', description: 'AC not working properly', status: 'pending', date: '2026-02-15' },
    { id: 2, studentId: 'EE2024002', studentName: 'Sarah Johnson', room: '201', type: 'Cleaning', description: 'Bathroom needs cleaning', status: 'resolved', date: '2026-02-14' },
];

// Mess Schedule
export const messSchedule = [
    { id: 1, day: 'Monday', breakfast: 'Idli, Sambar, Chutney', lunch: 'Rice, Dal, Roti, Mixed Veg', dinner: 'Chapati, Paneer Curry, Dal' },
    { id: 2, day: 'Tuesday', breakfast: 'Poha, Tea/Coffee', lunch: 'Rice, Sambar, Curd, Vegetable', dinner: 'Rice, Rajma, Salad' },
    { id: 3, day: 'Wednesday', breakfast: 'Upma, Chutney', lunch: 'Rice, Rasam, Cabbage Fry', dinner: 'Roti, Aloo Gobi, Dal' },
    { id: 4, day: 'Thursday', breakfast: 'Dosa, Sambar, Chutney', lunch: 'Rice, Dal, Bhindi Masala', dinner: 'Chapati, Chole, Rice' },
    { id: 5, day: 'Friday', breakfast: 'Paratha, Curd', lunch: 'Biryani, Raita, Boiled Egg', dinner: 'Roti, Dal Fry, Aloo Matar' },
    { id: 6, day: 'Saturday', breakfast: 'Bread, Omelette, Jam', lunch: 'Rice, Kadhi, Papad', dinner: 'Fried Rice, Manchurian' },
    { id: 7, day: 'Sunday', breakfast: 'Puri, Aloo Curry', lunch: 'Special Thali', dinner: 'Roti, Paneer Butter Masala' },
];

// Outpasses
export const outpasses = [
    { id: 1, studentId: 'CS2024001', studentName: 'John Smith', room: '102', reason: 'Home visit', fromDate: '2026-02-25', toDate: '2026-02-27', status: 'pending', requestDate: '2026-02-20', rejectionReason: null },
    { id: 2, studentId: 'EE2024002', studentName: 'Sarah Johnson', room: '201', reason: 'Medical checkup', fromDate: '2026-02-22', toDate: '2026-02-22', status: 'approved', requestDate: '2026-02-18', rejectionReason: null },
    { id: 3, studentId: 'ME2024003', studentName: 'Mike Brown', room: null, reason: 'Family function', fromDate: '2026-02-20', toDate: '2026-02-21', status: 'rejected', requestDate: '2026-02-15', rejectionReason: 'Insufficient notice period. Please apply at least 3 days in advance.' },
];

// Notices
export const notices = [
    { id: 1, title: 'Hostel Fest 2026', content: 'Annual hostel fest will be held on March 15th, 2026. All students are invited to participate. Registration starts from March 1st.', type: 'event', date: '2026-02-20', priority: 'high' },
    { id: 2, title: 'Water Supply Interruption', content: 'Water supply will be interrupted on February 28th from 10:00 AM to 2:00 PM for maintenance work. Please store water in advance.', type: 'maintenance', date: '2026-02-22', priority: 'high' },
    { id: 3, title: 'New Mess Timings', content: 'From March 1st, new mess timings will be: Breakfast 7-9 AM, Lunch 12-2 PM, Dinner 7-9 PM. Please note the changes.', type: 'general', date: '2026-02-18', priority: 'medium' },
];

// Attendance
export const attendance = [
    { id: 1, studentId: 'CS2024001', studentName: 'John Smith', room: '102', date: '2026-03-16', time: '22:30:15', status: 'present', latitude: 17.3850, longitude: 78.4867, location: 'Boys Hostel A' },
    { id: 2, studentId: 'EE2024002', studentName: 'Sarah Johnson', room: '201', date: '2026-03-16', time: '22:15:42', status: 'present', latitude: 17.3852, longitude: 78.4869, location: 'Girls Hostel B' },
    { id: 3, studentId: 'CS2024001', studentName: 'John Smith', room: '102', date: '2026-03-15', time: '22:45:20', status: 'present', latitude: 17.3850, longitude: 78.4867, location: 'Boys Hostel A' },
];

// Hostel GPS locations
export const hostelLocations = {
    'Boys Hostel A': { lat: 17.3850, lng: 78.4867, radius: 0.001 },
    'Girls Hostel B': { lat: 17.3852, lng: 78.4869, radius: 0.001 }
};

// Room Change Requests
export const roomChanges = [
    { id: 1, studentId: 'CS2024001', studentName: 'John Smith', currentRoom: '102', currentHostel: 'Boys Hostel A', preferredRoom: 'Any available', reason: 'Maintenance problems', details: 'The ceiling fan in my room makes a loud noise at night and I cannot sleep.', status: 'pending', date: '2026-03-25', rejectionReason: null },
];

// Visitors
export const visitors = [
    { id: 1, studentId: 'CS2024001', studentName: 'John Smith', studentRoom: '102', hostel: 'Boys Hostel A', visitorName: 'Robert Smith', relation: 'Parent', phone: '+91 9876500001', purpose: 'Personal visit', visitDate: '2026-04-10', visitTime: '11:00', details: 'My father is visiting to drop some items.', status: 'pending', requestDate: '2026-04-01', rejectionReason: null },
    { id: 2, studentId: 'EE2024002', studentName: 'Sarah Johnson', studentRoom: '201', hostel: 'Girls Hostel B', visitorName: 'Mary Johnson', relation: 'Parent', phone: '+91 9876500002', purpose: 'Medical emergency', visitDate: '2026-03-30', visitTime: '14:00', details: '', status: 'approved', requestDate: '2026-03-28', approvedDate: '2026-03-29', rejectionReason: null },
];

// Mess Feedback
export const messFeedback = [
    { id: 1, studentId: 'EE2024002', studentName: 'Sarah Johnson', date: '2026-03-28', day: 'Friday', breakfast: 4, lunch: 5, dinner: 3, comment: 'Biryani was great today!' },
    { id: 2, studentId: 'CS2024001', studentName: 'John Smith', date: '2026-03-27', day: 'Thursday', breakfast: 3, lunch: 4, dinner: 4, comment: '' },
];
