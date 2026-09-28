import React, { useState } from 'react';
import { api } from '../services/api';

const Outpass = ({ outpasses, user, reload }) => {
    const [showForm,    setShowForm]    = useState(false);
    const [form,        setForm]        = useState({ reason:'', fromDate:'', toDate:'' });
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason,setRejectReason]= useState('');
    const [filter,      setFilter]      = useState('all');
    const [saving,      setSaving]      = useState(false);

    const mine   = user.role==='student' ? outpasses.filter(o => o.studentId===user.studentId) : outpasses;
    const visible= filter==='all' ? mine : mine.filter(o => o.status===filter);
    const count  = (s) => s==='all' ? mine.length : mine.filter(o => o.status===s).length;

    const submit = async () => {
        if (!form.reason.trim()||!form.fromDate||!form.toDate) return alert('All fields are required.');
        setSaving(true);
        try { await api.outpasses.create(form); setForm({reason:'',fromDate:'',toDate:''}); setShowForm(false); await reload(); }
        catch (err) { alert(err.message); } finally { setSaving(false); }
    };

    const updateStatus = async (id, status, reason=null) => {
        try { await api.outpasses.updateStatus(id, status, reason); setRejectingId(null); setRejectReason(''); await reload(); }
        catch (err) { alert(err.message); }
    };

    const fmt = (d) => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});

    return (
        <div className="page-content">
            {user.role==='student' && (
                <div className="action-bar">
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm?'✕ Cancel':'+ Request Outpass'}</button>
                </div>
            )}
            {showForm && user.role==='student' && (
                <div className="form-card">
                    <h3>🔑 Request Outpass</h3>
                    <div className="form-row"><label>Reason</label><input placeholder="Reason for outpass..." value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} /></div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>From Date</label><input type="date" value={form.fromDate} onChange={e => setForm({...form,fromDate:e.target.value})} /></div>
                        <div className="form-row"><label>To Date</label><input type="date" value={form.toDate} onChange={e => setForm({...form,toDate:e.target.value})} /></div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={submit} disabled={saving}>{saving?'Submitting...':'Submit Request'}</button>
                        <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <div className="filter-bar">
                {['all','pending','approved','rejected'].map(s => (
                    <button key={s} className={`filter-btn ${filter===s?'active':''}`} onClick={() => setFilter(s)}>
                        {s.charAt(0).toUpperCase()+s.slice(1)} <span className="filter-count">{count(s)}</span>
                    </button>
                ))}
            </div>
            <div className="complaints-list">
                {visible.length===0 ? (
                    <div className="empty-state"><div className="empty-icon">🔑</div><p>No {filter!=='all'?filter:''} outpass requests.</p></div>
                ) : visible.map(o => (
                    <div key={o._id||o.id} className={`complaint-card status-border-${o.status}`}>
                        <div className="complaint-header">
                            <div className="complaint-meta">
                                {user.role==='hostel_manager' && <span className="complaint-student">👤 {o.studentName} · Room #{o.room||'N/A'}</span>}
                                <span className="complaint-date">📅 {fmt(o.fromDate)} → {fmt(o.toDate)}</span>
                            </div>
                            <span className={`status-badge status-${o.status}`}>
                                {o.status==='pending'?'⏳':o.status==='approved'?'✅':'❌'} {o.status}
                            </span>
                        </div>
                        <p className="complaint-desc"><strong>Reason:</strong> {o.reason}</p>
                        {o.rejectionReason && <div className="rejection-note"><strong>Rejection Reason:</strong> {o.rejectionReason}</div>}
                        {user.role==='hostel_manager' && o.status==='pending' && rejectingId!==o._id && (
                            <div className="admin-actions">
                                <button className="btn-success" onClick={() => updateStatus(o._id,'approved')}>✅ Approve</button>
                                <button className="btn-danger"  onClick={() => { setRejectingId(o._id); setRejectReason(''); }}>❌ Reject</button>
                            </div>
                        )}
                        {rejectingId===o._id && (
                            <div className="reject-form">
                                <textarea placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} />
                                <div className="form-actions">
                                    <button className="btn-danger" onClick={() => { if(!rejectReason.trim()) return alert('Provide reason.'); updateStatus(o._id,'rejected',rejectReason.trim()); }}>Confirm Reject</button>
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
export default Outpass;
