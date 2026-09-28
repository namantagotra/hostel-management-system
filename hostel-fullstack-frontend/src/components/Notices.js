import React, { useState } from 'react';
import { api } from '../services/api';

const Notices = ({ notices, role, reload }) => {
    const [showForm, setShowForm] = useState(false);
    const [form,     setForm]     = useState({ title:'', content:'', type:'general', priority:'medium' });
    const [saving,   setSaving]   = useState(false);

    const addNotice = async () => {
        if (!form.title.trim() || !form.content.trim()) return alert('Title and content are required.');
        setSaving(true);
        try {
            await api.notices.create(form);
            setForm({ title:'', content:'', type:'general', priority:'medium' });
            setShowForm(false);
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const deleteNotice = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try { await api.notices.delete(id); await reload(); }
        catch (err) { alert(err.message); }
    };

    return (
        <div className="page-content">
            {role === 'hostel_manager' && (
                <div className="action-bar">
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ New Notice'}</button>
                </div>
            )}
            {showForm && (
                <div className="form-card">
                    <h3>📢 Post a Notice</h3>
                    <div className="form-row"><label>Title</label><input placeholder="Notice title..." value={form.title} onChange={e => setForm({...form,title:e.target.value})} /></div>
                    <div className="form-row"><label>Content</label><textarea placeholder="Notice content..." value={form.content} onChange={e => setForm({...form,content:e.target.value})} rows={4} /></div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Type</label>
                            <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                                <option value="general">General</option><option value="event">Event</option><option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div className="form-row"><label>Priority</label>
                            <select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={addNotice} disabled={saving}>{saving?'Posting...':'Post Notice'}</button>
                        <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <div className="notices">
                {notices.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><p>No notices yet.</p></div>
                ) : notices.map(n => (
                    <div key={n._id||n.id} className={`notice priority-${n.priority}`}>
                        <div className="n-header">
                            <h3>{n.title}</h3>
                            <div className="badges">
                                <span className={`type ${n.type}`}>{n.type}</span>
                                <span className={`pri ${n.priority}`}>{n.priority}</span>
                                {role==='hostel_manager' && <button className="notice-delete" onClick={() => deleteNotice(n._id||n.id)}>✕ Delete</button>}
                            </div>
                        </div>
                        <div className="content">{n.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Notices;
