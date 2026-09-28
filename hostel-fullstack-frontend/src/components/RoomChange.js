import React, { useState } from 'react';
import { api } from '../services/api';

const REASONS = ['Roommate issues','Maintenance problems','Floor preference','Hostel transfer','Medical reasons','Other'];

const RoomChange = ({ roomChanges, rooms, students, user, reload }) => {
    const [showForm,    setShowForm]    = useState(false);
    const [form,        setForm]        = useState({ reason:'Roommate issues', preferredRoom:'', details:'' });
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason,setRejectReason]= useState('');
    const [filter,      setFilter]      = useState('all');
    const [saving,      setSaving]      = useState(false);

    const allVisible  = user.role === 'hostel_manager' ? roomChanges : roomChanges.filter(r => r.studentId === user.studentId);
    const filtered    = filter === 'all' ? allVisible : allVisible.filter(r => r.status === filter);
    const countFor    = s => s === 'all' ? allVisible.length : allVisible.filter(r => r.status === s).length;
    const availableRooms = rooms.filter(r => r.status === 'available');
    const hasPending  = roomChanges.some(r => r.studentId === user.studentId && r.status === 'pending');

    const submitRequest = async () => {
        if (!user.room) return alert('You must have a room assigned before requesting a change.');
        if (hasPending) return alert('You already have a pending room change request.');
        if (!form.details.trim()) return alert('Please provide details about your request.');
        setSaving(true);
        try {
            await api.roomChanges.create({
                reason: form.reason,
                preferredRoom: form.preferredRoom || 'Any available',
                details: form.details.trim(),
            });
            setForm({ reason:'Roommate issues', preferredRoom:'', details:'' });
            setShowForm(false);
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const approveChange = async (req) => {
        const targetRoom = req.preferredRoom === 'Any available'
            ? availableRooms[0]
            : rooms.find(r => r.number === req.preferredRoom && r.status === 'available');
        if (!targetRoom) return alert('The requested room is not available. Please reject.');
        try {
            await api.roomChanges.updateStatus(req._id || req.id, {
                status: 'approved',
                approvedRoom: targetRoom.number,
                approvedHostel: targetRoom.hostel,
            });
            await reload();
        } catch (err) { alert(err.message); }
    };

    const rejectChange = async (id) => {
        if (!rejectReason.trim()) return alert('Please provide a rejection reason.');
        try {
            await api.roomChanges.updateStatus(id, { status:'rejected', rejectionReason: rejectReason.trim() });
            setRejectingId(null); setRejectReason('');
            await reload();
        } catch (err) { alert(err.message); }
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '-';

    return (
        <div className="page-content">
            {user.role === 'student' && (
                <div className="action-bar">
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Request Room Change'}</button>
                </div>
            )}
            {showForm && user.role === 'student' && (
                <div className="form-card">
                    <h3>🔄 Request Room Change</h3>
                    {user.room
                        ? <div className="info-banner">Current Room: <strong>#{user.room}</strong> · {user.hostel}</div>
                        : <div className="info-banner" style={{color:'#e65100'}}>⚠️ You don't have a room assigned yet.</div>}
                    <div className="form-row"><label>Reason</label>
                        <select value={form.reason} onChange={e => setForm({...form,reason:e.target.value})}>
                            {REASONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="form-row"><label>Preferred Room (optional)</label>
                        <select value={form.preferredRoom} onChange={e => setForm({...form,preferredRoom:e.target.value})}>
                            <option value="">Any available</option>
                            {availableRooms.map(r => <option key={r._id||r.id} value={r.number}>#{r.number} — {r.type} ({r.hostel})</option>)}
                        </select>
                    </div>
                    <div className="form-row"><label>Details *</label>
                        <textarea placeholder="Explain your situation in detail..." value={form.details} onChange={e => setForm({...form,details:e.target.value})} rows={4} />
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={submitRequest} disabled={saving}>{saving?'Submitting...':'Submit Request'}</button>
                        <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="filter-bar">
                {['all','pending','approved','rejected'].map(s => (
                    <button key={s} className={`filter-btn ${filter===s?'active':''}`} onClick={() => setFilter(s)}>
                        {s.charAt(0).toUpperCase()+s.slice(1)} <span className="filter-count">{countFor(s)}</span>
                    </button>
                ))}
            </div>

            <div className="complaints-list">
                {filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🔄</div><p>No room change requests.</p></div>
                ) : filtered.map(req => (
                    <div key={req._id||req.id} className={`complaint-card status-border-${req.status}`}>
                        <div className="complaint-header">
                            <div className="complaint-meta">
                                {user.role==='hostel_manager' && <span className="complaint-student">👤 {req.studentName}</span>}
                                <span className="complaint-type-tag">{req.reason}</span>
                                <span className="complaint-date">📅 {fmt(req.date||req.createdAt)}</span>
                            </div>
                            <span className={`status-badge status-${req.status}`}>
                                {req.status==='pending'?'⏳':req.status==='approved'?'✅':'❌'} {req.status}
                            </span>
                        </div>
                        <div className="room-change-rooms">
                            <div className="rc-room current"><span className="rc-label">Current</span><span className="rc-val">#{req.currentRoom||'N/A'}</span></div>
                            <span className="rc-arrow">→</span>
                            <div className="rc-room preferred"><span className="rc-label">Preferred</span><span className="rc-val">{req.preferredRoom||'Any'}</span></div>
                            {req.approvedRoom && <><span className="rc-arrow">✅</span><div className="rc-room approved-room"><span className="rc-label">Approved</span><span className="rc-val">#{req.approvedRoom}</span></div></>}
                        </div>
                        <p className="complaint-desc">{req.details}</p>
                        {req.rejectionReason && <div className="rejection-note"><strong>Rejection Reason:</strong> {req.rejectionReason}</div>}
                        {user.role==='hostel_manager' && req.status==='pending' && rejectingId!==(req._id||req.id) && (
                            <div className="admin-actions">
                                <button className="btn-success" onClick={() => approveChange(req)}>✅ Approve</button>
                                <button className="btn-danger"  onClick={() => { setRejectingId(req._id||req.id); setRejectReason(''); }}>❌ Reject</button>
                            </div>
                        )}
                        {rejectingId===(req._id||req.id) && (
                            <div className="reject-form">
                                <textarea placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} />
                                <div className="form-actions">
                                    <button className="btn-danger" onClick={() => rejectChange(req._id||req.id)}>Confirm Reject</button>
                                    <button className="btn-ghost" onClick={() => setRejectingId(null)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default RoomChange;
