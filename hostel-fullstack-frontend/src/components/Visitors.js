import React, { useState } from 'react';
import { api } from '../services/api';

const RELATIONS = ['Parent','Sibling','Relative','Friend','Guardian','Other'];

const Visitors = ({ visitors, user, reload }) => {
    const [showForm,    setShowForm]    = useState(false);
    const [form,        setForm]        = useState({ visitorName:'',relation:'Parent',phone:'',purpose:'',visitDate:'',visitTime:'',details:'' });
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason,setRejectReason]= useState('');
    const [filter,      setFilter]      = useState('all');
    const [saving,      setSaving]      = useState(false);

    const mine   = user.role==='student' ? visitors.filter(v => v.studentId===user.studentId) : visitors;
    const visible= filter==='all' ? mine : mine.filter(v => v.status===filter);
    const count  = (s) => s==='all' ? mine.length : mine.filter(v => v.status===s).length;
    const fmt    = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '-';

    const submit = async () => {
        if (!form.visitorName.trim()||!form.relation||!form.phone.trim()||!form.purpose.trim()||!form.visitDate||!form.visitTime)
            return alert('All required fields must be filled.');
        setSaving(true);
        try { await api.visitors.create(form); setForm({visitorName:'',relation:'Parent',phone:'',purpose:'',visitDate:'',visitTime:'',details:''}); setShowForm(false); await reload(); }
        catch (err) { alert(err.message); } finally { setSaving(false); }
    };

    const updateStatus = async (id, status, reason=null) => {
        try { await api.visitors.updateStatus(id, status, reason); setRejectingId(null); setRejectReason(''); await reload(); }
        catch (err) { alert(err.message); }
    };

    return (
        <div className="page-content">
            {user.role==='student' && (
                <div className="action-bar"><button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm?'✕ Cancel':'+ Register Visitor'}</button></div>
            )}
            {showForm && user.role==='student' && (
                <div className="form-card">
                    <h3>👥 Register Visitor</h3>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Visitor Name *</label><input placeholder="Full name" value={form.visitorName} onChange={e => setForm({...form,visitorName:e.target.value})} /></div>
                        <div className="form-row"><label>Relation *</label><select value={form.relation} onChange={e => setForm({...form,relation:e.target.value})}>{RELATIONS.map(r => <option key={r}>{r}</option>)}</select></div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Phone *</label><input placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
                        <div className="form-row"><label>Purpose *</label><input placeholder="Reason for visit" value={form.purpose} onChange={e => setForm({...form,purpose:e.target.value})} /></div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Visit Date *</label><input type="date" value={form.visitDate} onChange={e => setForm({...form,visitDate:e.target.value})} /></div>
                        <div className="form-row"><label>Visit Time *</label><input type="time" value={form.visitTime} onChange={e => setForm({...form,visitTime:e.target.value})} /></div>
                    </div>
                    <div className="form-row"><label>Additional Details</label><textarea placeholder="Any additional info..." value={form.details} onChange={e => setForm({...form,details:e.target.value})} rows={3} /></div>
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
                    <div className="empty-state"><div className="empty-icon">👥</div><p>No visitor requests.</p></div>
                ) : visible.map(v => (
                    <div key={v._id||v.id} className={`complaint-card status-border-${v.status}`}>
                        <div className="complaint-header">
                            <div className="complaint-meta">
                                {user.role==='hostel_manager' && <span className="complaint-student">👤 {v.studentName} · Room #{v.studentRoom}</span>}
                                <span className="complaint-type-tag">{v.relation}</span>
                                <span className="complaint-date">📅 {fmt(v.visitDate)} at {v.visitTime}</span>
                            </div>
                            <span className={`status-badge status-${v.status}`}>{v.status==='pending'?'⏳':v.status==='approved'?'✅':'❌'} {v.status}</span>
                        </div>
                        <div className="visitor-info">
                            <div className="vi-row"><span className="vi-label">Visitor</span><span className="vi-val">{v.visitorName}</span></div>
                            <div className="vi-row"><span className="vi-label">Phone</span><span className="vi-val">{v.phone}</span></div>
                            <div className="vi-row"><span className="vi-label">Purpose</span><span className="vi-val">{v.purpose}</span></div>
                            <div className="vi-row"><span className="vi-label">Hostel</span><span className="vi-val">{v.hostel||'-'}</span></div>
                        </div>
                        {v.details && <p className="complaint-desc">{v.details}</p>}
                        {v.rejectionReason && <div className="rejection-note"><strong>Rejection Reason:</strong> {v.rejectionReason}</div>}
                        {v.approvedDate && v.status==='approved' && <div className="approval-note">✅ Approved on {fmt(v.approvedDate)}</div>}
                        {user.role==='hostel_manager' && v.status==='pending' && rejectingId!==v._id && (
                            <div className="admin-actions">
                                <button className="btn-success" onClick={() => updateStatus(v._id,'approved')}>✅ Approve</button>
                                <button className="btn-danger"  onClick={() => { setRejectingId(v._id); setRejectReason(''); }}>❌ Reject</button>
                            </div>
                        )}
                        {rejectingId===v._id && (
                            <div className="reject-form">
                                <textarea placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} />
                                <div className="form-actions">
                                    <button className="btn-danger" onClick={() => { if(!rejectReason.trim()) return alert('Provide reason.'); updateStatus(v._id,'rejected',rejectReason.trim()); }}>Confirm Reject</button>
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
export default Visitors;
