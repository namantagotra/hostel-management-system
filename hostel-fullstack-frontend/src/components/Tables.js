import React from 'react';

export const Rooms = ({ rooms }) => (
    <div className="card">
        <table>
            <thead><tr><th>Room</th><th>Type</th><th>Capacity</th><th>Price</th><th>Floor</th><th>Hostel</th><th>Status</th></tr></thead>
            <tbody>
                {rooms.map(r => (
                    <tr key={r.id}>
                        <td>#{r.number}</td>
                        <td>{r.type}</td>
                        <td>{r.capacity}</td>
                        <td>₹{r.price}</td>
                        <td>Floor {r.floor}</td>
                        <td>{r.hostel}</td>
                        <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const Students = ({ students }) => (
    <div className="card">
        <table>
            <thead><tr><th>Name</th><th>ID</th><th>Email</th><th>Dept</th><th>Year</th><th>Room</th><th>Hostel</th></tr></thead>
            <tbody>
                {students.map(s => (
                    <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.studentId}</td>
                        <td>{s.email}</td>
                        <td>{s.department}</td>
                        <td>{s.year}</td>
                        <td>{s.room ? `#${s.room}` : 'Not Allotted'}</td>
                        <td>{s.hostel || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const Complaints = ({ complaints, user }) => {
    const filtered = user.role === 'hostel_manager' ? complaints : complaints.filter(c => c.studentId === user.studentId);
    
    return (
        <div className="card">
            <table>
                <thead><tr><th>Student</th><th>Room</th><th>Type</th><th>Description</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                    {filtered.map(c => (
                        <tr key={c.id}>
                            <td>{c.studentName}</td>
                            <td>#{c.room}</td>
                            <td>{c.type}</td>
                            <td>{c.description}</td>
                            <td>{new Date(c.date).toLocaleDateString()}</td>
                            <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const Mess = ({ messSchedule }) => (
    <div className="card">
        <table>
            <thead><tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr></thead>
            <tbody>
                {messSchedule.map(m => (
                    <tr key={m.id}>
                        <td><b>{m.day}</b></td>
                        <td>{m.breakfast}</td>
                        <td>{m.lunch}</td>
                        <td>{m.dinner}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
