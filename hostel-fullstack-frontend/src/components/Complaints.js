import React, { useState } from 'react';
import { api } from '../services/api';

const COMPLAINT_TYPES = ['Maintenance','Cleaning','Security','Electrical','Plumbing','Internet','Other'];

const Complaints = ({ complaints, user, reload }) => {
    const [showForm,    setShowForm]    = useState(false);
    const [form,        setForm]        = useState({ type:'Maintenance', description:'' });
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason,setRejectReason]= useState('');
    const [filter,      setFilter]      = useState('all');
    const [saving,      setSaving]      = useState(false);

    const allVisible = user.role === 'hostel_manager' ? complaints : complaints.filter(c => c.studentId === user.studentId);
    const filtered   = filter === 'all' ? allVisible : allVisible.filter(c => c.status === filter);
    const statusCount = (s) => s === 'all' ? allVisible.length : allVisible.filter(c => c.status === s).length;

    const submitComplaint = async () => {
        if (!form.description.trim()) return alert('Please describe the issue clearly.');
        setSaving(true);
        try {
            await api.complaints.create({ type: form.type, description: form.description.trim() });
            setForm({ type:'Maintenance', description:'' });
            setShowForm(false);
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const updateStatus = async (id, status, reason = null) => {
        try {
            await api.complaints.updateStatus(id, status, reason);
            setRejectingId(null); setRejectReason('');
            await reload();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="page-content">
            {user.role === 'student' && (
                <div className="action-bar">
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancel' : '+ New Complaint'}
                    </button>
                </div>
            )}
            {showForm && user.role === 'student' && (
                <div className="form-card">
                    <h3>📝 Submit a Complaint</h3>
                    <div className="form-row"><label>Type</label>
                        <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                            {COMPLAINT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-row"><label>Description</label>
                        <textarea placeholder="Describe the issue in detail..." value={form.description}
                            onChange={e => setForm({...form, description:e.target.value})} rows={4} />
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={submitComplaint} disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</button>
                        <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <div className="filter-bar">
                {['all','pending','resolved','rejected'].map(s => (
                    <button key={s} className={`filter-btn ${filter===s?'active':''}`} onClick={() => setFilter(s)}>
                        {s.charAt(0).toUpperCase()+s.slice(1)} <span className="filter-count">{statusCount(s)}</span>
                    </button>
                ))}
            </div>
            <div className="complaints-list">
                {filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📝</div><p>No {filter!=='all'?filter:''} complaints found.</p>
                        {user.role==='student' && <button className="btn-primary" onClick={() => setShowForm(true)}>Submit a Complaint</button>}
                    </div>
                ) : filtered.map(c => (
                    <div key={c._id||c.id} className={`complaint-card status-border-${c.status}`}>
                        <div className="complaint-header">
                            <div className="complaint-meta">
                                <span className="complaint-type-tag">{c.type}</span>
                                {user.role==='hostel_manager' && <span className="complaint-student">👤 {c.studentName} · Room #{c.room}</span>}
                                <span className="complaint-date">📅 {new Date(c.createdAt||c.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                            </div>
                            <span className={`status-badge status-${c.status}`}>
                                {c.status==='pending'?'⏳':c.status==='resolved'?'✅':'❌'} {c.status}
                            </span>
                        </div>
                        <p className="complaint-desc">{c.description}</p>
                        {c.rejectionReason && <div className="rejection-note"><strong>Rejection Reason:</strong> {c.rejectionReason}</div>}
                        {user.role==='hostel_manager' && c.status==='pending' && rejectingId!==c._id && (
                            <div className="admin-actions">
                                <button className="btn-success" onClick={() => updateStatus(c._id,'resolved')}>✅ Mark Resolved</button>
                                <button className="btn-danger"  onClick={() => { setRejectingId(c._id); setRejectReason(''); }}>❌ Reject</button>
                            </div>
                        )}
                        {user.role==='hostel_manager' && c.status==='resolved' && (
                            <div className="admin-actions">
                                <button className="btn-warning" onClick={() => updateStatus(c._id,'pending')}>↩ Reopen</button>
                            </div>
                        )}
                        {rejectingId===c._id && (
                            <div className="reject-form">
                                <textarea placeholder="Reason for rejection (required)..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} />
                                <div className="form-actions">
                                    <button className="btn-danger" onClick={() => { if(!rejectReason.trim()) return alert('Please provide a rejection reason.'); updateStatus(c._id,'rejected',rejectReason.trim()); }}>Confirm Reject</button>
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
export default Complaints;
