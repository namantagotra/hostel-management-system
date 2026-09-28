// Authentication
export const validateLogin = (email, password, role, students, superAdmin, hostelManagers) => {
    if (role === 'super_admin') {
        return email === superAdmin.email && password === superAdmin.password ? superAdmin : null;
    }
    if (role === 'hostel_manager') {
        return hostelManagers.find(m => m.email === email && m.password === password) || null;
    }
    return students.find(s => s.email === email && s.password === password) || null;
};

// Date formatting
export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
});

// GPS distance calculation
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
};

// Check if within hostel radius
export const isWithinHostel = (userLat, userLng, hostelLocation) => {
    const distance = calculateDistance(userLat, userLng, hostelLocation.lat, hostelLocation.lng);
    return distance <= hostelLocation.radius;
};

// Page metadata
export const pageConfig = {
    dashboard: { title: 'Dashboard', desc: 'Overview of hostel operations' },
    rooms: { title: 'Room Management', desc: 'View all available rooms' },
    students: { title: 'Student Management', desc: 'Manage student room allotments' },
    complaints: { title: 'Complaints', desc: 'Track and resolve complaints' },
    mess: { title: 'Mess Schedule', desc: 'Weekly mess menu schedule' },
    outpass: { title: 'Outpass Management', desc: 'Request and manage outpasses' },
    notices: { title: 'Notice Board', desc: 'Important announcements and updates' },
    attendance: { title: 'Attendance System', desc: 'Location-based attendance tracking' }
};

// New page configs
Object.assign(pageConfig, {
    roomchange:     { title: 'Room Change Requests', desc: 'Request or manage room transfers' },
    lostfound:      { title: 'Lost & Found',          desc: 'Post and find lost items' },
    visitors:       { title: 'Visitor Requests',      desc: 'Register and approve visitor entries' },
    messfeedback:   { title: 'Mess Feedback',         desc: 'Rate meals and view weekly summary' },
    hostelmanagers:     { title: 'Hostel Manager Profiles', desc: 'Create, manage and delete hostel manager accounts' },
    hostelapplications: { title: 'Hostel Applications',    desc: 'Review and approve student hostel admission requests' },
    feepayment:         { title: 'Fee Payments',            desc: 'Submit and verify hostel fee payment proofs' },
});
