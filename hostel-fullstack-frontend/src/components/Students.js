import React, { useState } from 'react';
import { api } from '../services/api';

const DEPARTMENTS = ['Computer Science','Electrical Eng','Mechanical Eng','Civil Eng','Electronics','Information Technology','Other'];
const YEARS = ['1st','2nd','3rd','4th'];

const Students = ({ students, rooms, feePayments=[], reload }) => {
    const [showForm,     setShowForm]     = useState(false);
    const [allocatingId, setAllocatingId] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [deletingId,   setDeletingId]   = useState(null);
    const [form, setForm] = useState({ name:'',email:'',studentId:'',department:'Computer Science',year:'1st',phone:'',password:'' });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = students.filter(s =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        (s.department||'').toLowerCase().includes(search.toLowerCase())
    );

    const registerStudent = async () => {
        if (!form.name.trim())  return alert('Name is required.');
        if (!form.email.trim() || !form.email.includes('@')) return alert('Valid email is required.');
        if (!form.studentId.trim()) return alert('Student ID is required.');
        if (!form.password.trim() || form.password.length < 6) return alert('Password must be at least 6 characters.');
        setSaving(true);
        try {
            await api.students.register(form);
            setForm({ name:'',email:'',studentId:'',department:'Computer Science',year:'1st',phone:'',password:'' });
            setShowForm(false);
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const saveAllocation = async (student) => {
        if (!selectedRoom) return alert('Please select a room.');
        setSaving(true);
        try { await api.students.allocate(student._id, selectedRoom); setAllocatingId(null); await reload(); }
        catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const deallocateRoom = async (student) => {
        if (!window.confirm(`Remove room from ${student.name}?`)) return;
        try { await api.students.deallocate(student._id); await reload(); }
        catch (err) { alert(err.message); }
    };

    const deleteStudent = async (student) => {
        setSaving(true);
        try {
            await api.students.delete(student._id);
            setDeletingId(null);
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const allRoomsForStudent = (student) => rooms.filter(r => r.status === 'available' || r.number === student.room);

    return (
        <div className="page-content">
            {/* Top bar */}
            <div className="action-bar" style={{ gap: 10 }}>
                <input
                    placeholder="Search by name, ID or department..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, flex:1, maxWidth:320, fontFamily:'inherit' }}
                />
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Register Student'}
                </button>
            </div>

            {/* Register form */}
            {showForm && (
                <div className="form-card">
                    <h3>👤 Register New Student</h3>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Full Name</label><input placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
                        <div className="form-row"><label>Student ID</label><input placeholder="e.g. CS2024005" value={form.studentId} onChange={e => setForm({...form,studentId:e.target.value})} /></div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Email</label><input type="email" placeholder="student@college.edu" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
                        <div className="form-row"><label>Phone</label><input placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Department</label>
                            <select value={form.department} onChange={e => setForm({...form,department:e.target.value})}>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-row"><label>Year</label>
                            <select value={form.year} onChange={e => setForm({...form,year:e.target.value})}>
                                {YEARS.map(y => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row"><label>Login Password</label>
                        <input type="text" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({...form,password:e.target.value})} />
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={registerStudent} disabled={saving}>{saving ? 'Registering...' : 'Register Student'}</button>
                        <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="fee-summary-row">
                <div className="fee-summary-card total"><div className="fee-sum-icon">🎓</div><div><div className="fee-sum-value">{students.length}</div><div className="fee-sum-label">Total Students</div></div></div>
                <div className="fee-summary-card verified"><div className="fee-sum-icon">🏠</div><div><div className="fee-sum-value">{students.filter(s=>s.room).length}</div><div className="fee-sum-label">Room Assigned</div></div></div>
                <div className="fee-summary-card pending"><div className="fee-sum-icon">⏳</div><div><div className="fee-sum-value">{students.filter(s=>!s.room).length}</div><div className="fee-sum-label">No Room</div></div></div>
            </div>

            {/* Table */}
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Student ID</th>
                            <th>Email</th>
                            <th>Dept</th>
                            <th>Year</th>
                            <th>Room</th>
                            <th>Hostel</th>
                            <th>Fee Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => {
                            const myFees   = feePayments.filter(p => p.studentId === s.studentId);
                            const verified = myFees.filter(p => p.status === 'verified');
                            const pending  = myFees.filter(p => p.status === 'pending');
                            const rejected = myFees.filter(p => p.status === 'rejected');
                            const totalPaid= verified.reduce((acc,p) => acc+p.amount, 0);
                            let feeStatus, feeBg, feeColor;
                            if (myFees.length === 0)                                           { feeStatus='— No Submission'; feeBg='#f3f4f6'; feeColor='#6b7280'; }
                            else if (verified.length>0&&pending.length===0&&rejected.length===0){ feeStatus=`✅ ₹${totalPaid.toLocaleString('en-IN')}`; feeBg='#e0f2f1'; feeColor='#00695c'; }
                            else if (pending.length>0)                                          { feeStatus=`⏳ Pending (${pending.length})`; feeBg='#fff3e0'; feeColor='#e65100'; }
                            else if (rejected.length>0&&verified.length===0)                    { feeStatus='❌ Rejected'; feeBg='#ffebee'; feeColor='#b71c1c'; }
                            else                                                                { feeStatus='🔄 Partial'; feeBg='#e8eaf6'; feeColor='#3949ab'; }

                            return (
                            <tr key={s._id||s.id}>
                                <td><div style={{fontWeight:600}}>{s.name}</div></td>
                                <td>{s.studentId}</td>
                                <td style={{fontSize:13}}>{s.email}</td>
                                <td>{s.department}</td>
                                <td>{s.year}</td>
                                <td>
                                    {allocatingId === s._id ? (
                                        <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                                            style={{padding:'4px 8px',borderRadius:6,border:'1px solid #e2e8f0',fontSize:13}}>
                                            <option value="">-- Select Room --</option>
                                            {allRoomsForStudent(s).map(r => (
                                                <option key={r._id||r.id} value={r.number}>#{r.number} {r.type} ({r.hostel})</option>
                                            ))}
                                        </select>
                                    ) : s.room
                                        ? <span className="badge available">#{s.room}</span>
                                        : <span style={{color:'#a0aec0',fontSize:13}}>Not Allotted</span>}
                                </td>
                                <td>{s.hostel || '-'}</td>
                                <td>
                                    <span style={{background:feeBg,color:feeColor,borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>
                                        {feeStatus}
                                    </span>
                                </td>
                                <td>
                                    {allocatingId === s._id ? (
                                        <>
                                            <button className="tbl-btn save" onClick={() => saveAllocation(s)} disabled={saving}>Save</button>
                                            <button className="tbl-btn cancel" onClick={() => setAllocatingId(null)}>Cancel</button>
                                        </>
                                    ) : deletingId === s._id ? (
                                        <>
                                            <button className="tbl-btn danger" onClick={() => deleteStudent(s)} disabled={saving}>{saving?'Deleting...':'Confirm'}</button>
                                            <button className="tbl-btn cancel" onClick={() => setDeletingId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="tbl-btn edit" onClick={() => { setAllocatingId(s._id); setSelectedRoom(s.room||''); }}>🏠 Allocate</button>
                                            {s.room && <button className="tbl-btn cancel" onClick={() => deallocateRoom(s)}>✕ Room</button>}
                                            <button className="tbl-btn danger" onClick={() => setDeletingId(s._id)}>🗑 Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🎓</div>
                        <p>{search ? `No students matching "${search}"` : 'No students registered yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Students;
