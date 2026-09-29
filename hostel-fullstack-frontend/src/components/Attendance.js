import React, { useState } from 'react';
import { hostelLocations } from '../data';
import { isWithinHostel } from '../utils/helpers';
import { api } from '../services/api';

const Attendance = ({ attendance, user, reload }) => {
    const [loading, setLoading] = useState(false);
    const filtered = user.role==='hostel_manager' ? attendance : attendance.filter(a => a.studentId===user.studentId);
    const today    = new Date().toISOString().split('T')[0];
    const marked   = attendance.find(a => a.studentId===user.studentId && (a.date||'').startsWith(today));

    const markAttendance = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        if (!user.hostel) return alert('No hostel assigned. Contact admin.');
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const hostelLoc = hostelLocations[user.hostel];
                if (!hostelLoc) { setLoading(false); return alert('Hostel location not configured'); }
                if (!isWithinHostel(latitude, longitude, hostelLoc)) { setLoading(false); return alert('You are not within hostel premises (100m radius)'); }
                try {
                    await api.attendance.mark({ latitude, longitude, location: user.hostel });
                    await reload();
                    alert('✅ Attendance is marked!');
                } catch (err) { alert(err.message); }
                finally { setLoading(false); }
            },
            () => { setLoading(false); alert('Location access denied'); },
            { enableHighAccuracy:true, timeout:10000 }
        );
    };

    return (
        <div className="attendance">
            {user.role==='student' && (
                <div className="mark-section">
                    <div className="mark-card">
                        <div className="icon">📍</div>
                        <h3>Mark Your Attendance</h3>
                        <p>Must be within 100m of hostel premises</p>
                        <button onClick={markAttendance} disabled={loading||!!marked} className="btn">
                            {loading ? '📡 Getting Location...' : marked ? '✅ Marked Today' : '✓ Mark Now'}
                        </button>
                    </div>
                    <div className="info"><h4>ℹ️ How it Works</h4><ul><li>GPS location verification</li><li>100m radius check</li><li>Once per day only</li></ul></div>
                </div>
            )}
            <div className="card">
                <h3>{user.role==='hostel_manager' ? 'All Records' : 'My History'}</h3>
                <table>
                    <thead><tr>
                        {user.role==='hostel_manager' && <><th>Student</th><th>Room</th></>}
                        <th>Date</th><th>Time</th><th>Status</th><th>Location</th><th>Coordinates</th>
                    </tr></thead>
                    <tbody>
                        {filtered.map(a => (
                            <tr key={a._id||a.id}>
                                {user.role==='hostel_manager' && <><td>{a.studentName}</td><td>{a.room?`#${a.room}`:'N/A'}</td></>}
                                <td>{new Date(a.date||a.createdAt).toLocaleDateString()}</td>
                                <td className="mono">{a.time}</td>
                                <td><span className={`badge ${a.status}`}>{a.status==='present'?'✓ Present':'✗ Absent'}</span></td>
                                <td>{a.location}</td>
                                <td className="mono">
                                    {a.latitude ? <a href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`} target="_blank" rel="noopener noreferrer">📍 {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}</a> : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length===0 && <p className="empty">No records yet</p>}
            </div>
        </div>
    );
};
export default Attendance;
