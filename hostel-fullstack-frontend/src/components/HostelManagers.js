import React, { useState } from 'react';
import { api } from '../services/api';

const emptyForm = { name:'',email:'',password:'',hostel:'',phone:'' };
const HOSTELS   = ['Boys Hostel A','Girls Hostel B'];

const HostelManagers = ({ hostelManagers, students, reload }) => {
    const [showForm,       setShowForm]       = useState(false);
    const [form,           setForm]           = useState(emptyForm);
    const [errors,         setErrors]         = useState({});
    const [search,         setSearch]         = useState('');
    const [confirmDelete,  setConfirmDelete]  = useState(null);
    const [saving,         setSaving]         = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim())  e.name  = 'Name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        if (!form.password.trim()) e.password = 'Password is required';
        if (!form.hostel.trim()) e.hostel = 'Hostel assignment is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await api.managers.create({ name:form.name, email:form.email, password:form.password, managedHostel:form.hostel, phone:form.phone });
            setForm(emptyForm); setShowForm(false); setErrors({});
            await reload();
        } catch (err) { setErrors({ submit: err.message }); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        setSaving(true);
        try { await api.managers.delete(id); setConfirmDelete(null); await reload(); }
        catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const filtered = hostelManagers.filter(m =>
        !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        (m.managedHostel||m.hostel||'').toLowerCase().includes(search.toLowerCase())
    );

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

    return (
        <div className="page-content">
            <div className="action-bar" style={{gap:10}}>
                <input placeholder="Search managers..." value={search} onChange={e=>setSearch(e.target.value)}
                    style={{padding:'9px 14px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,flex:1,maxWidth:320,fontFamily:'inherit'}}/>
                <button className="btn-primary" onClick={()=>{setShowForm(!showForm);setErrors({});setForm(emptyForm);}}>
                    {showForm?'✕ Cancel':'+ Add Manager'}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>👤 Add Hostel Manager</h3>
                    {errors.submit && <div className="login-error">⚠️ {errors.submit}</div>}
                    <div className="form-row-2col">
                        <div className="form-row"><label>Full Name *</label><input placeholder="Manager name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>{errors.name&&<span className="field-error">{errors.name}</span>}</div>
                        <div className="form-row"><label>Email *</label><input type="email" placeholder="manager@college.edu" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>{errors.email&&<span className="field-error">{errors.email}</span>}</div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row"><label>Password *</label><input type="text" placeholder="Min 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>{errors.password&&<span className="field-error">{errors.password}</span>}</div>
                        <div className="form-row"><label>Phone</label><input placeholder="+91 9000000000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                    </div>
                    <div className="form-row"><label>Assign Hostel *</label>
                        <select value={form.hostel} onChange={e=>setForm({...form,hostel:e.target.value})}>
                            <option value="">Select hostel</option>
                            {HOSTELS.map(h=><option key={h}>{h}</option>)}
                        </select>
                        {errors.hostel&&<span className="field-error">{errors.hostel}</span>}
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Adding...':'Add Manager'}</button>
                        <button className="btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="fee-summary-row">
                <div className="fee-summary-card verified"><div className="fee-sum-icon">👤</div><div><div className="fee-sum-value">{hostelManagers.length}</div><div className="fee-sum-label">Total Managers</div></div></div>
                <div className="fee-summary-card total"><div className="fee-sum-icon">🎓</div><div><div className="fee-sum-value">{students.length}</div><div className="fee-sum-label">Total Students</div></div></div>
            </div>

            {/* Manager cards */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {filtered.length===0 ? (
                    <div className="empty-state"><div className="empty-icon">👤</div><p>No managers found.</p></div>
                ) : filtered.map(m => (
                    <div key={m._id||m.id} className="form-card" style={{padding:'18px 22px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                            <div style={{display:'flex',gap:14,alignItems:'center'}}>
                                <div className="avatar" style={{width:44,height:44,flexShrink:0}}>{m.name[0]}</div>
                                <div>
                                    <div style={{fontWeight:700,fontSize:16,color:'#1a202c'}}>{m.name}</div>
                                    <div style={{fontSize:13,color:'#718096',marginTop:2}}>{m.email}</div>
                                    <div style={{fontSize:12,marginTop:4,display:'flex',gap:8,flexWrap:'wrap'}}>
                                        <span style={{background:'#e8eaf6',color:'#3949ab',borderRadius:6,padding:'2px 8px',fontWeight:600}}>🏠 {m.managedHostel||m.hostel||'—'}</span>
                                        {m.phone&&<span style={{background:'#f3f4f6',color:'#4b5563',borderRadius:6,padding:'2px 8px',fontWeight:600}}>📞 {m.phone}</span>}
                                        <span style={{background:'#f3f4f6',color:'#6b7280',borderRadius:6,padding:'2px 8px',fontSize:11}}>Since {fmt(m.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{display:'flex',gap:8}}>
                                {confirmDelete===(m._id||m.id) ? (
                                    <>
                                        <button className="btn-danger" onClick={()=>handleDelete(m._id||m.id)} disabled={saving}>{saving?'Deleting...':'Confirm Delete'}</button>
                                        <button className="btn-ghost" onClick={()=>setConfirmDelete(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn-danger" style={{fontSize:13,padding:'7px 14px'}} onClick={()=>setConfirmDelete(m._id||m.id)}>🗑 Delete</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default HostelManagers;
