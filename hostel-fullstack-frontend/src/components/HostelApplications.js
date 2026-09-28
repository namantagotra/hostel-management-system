import React, { useState } from 'react';
import { api } from '../services/api';

const statusColor = { pending:'#f59e0b', approved:'#10b981', rejected:'#ef4444' };
const statusBg    = { pending:'#fffbeb', approved:'#ecfdf5', rejected:'#fef2f2' };

const HostelApplications = ({ hostelApplications, rooms: roomsProp, students: studentsProp, reload }) => {
    const rooms    = Array.isArray(roomsProp)    ? roomsProp    : [];
    const apps     = Array.isArray(hostelApplications) ? hostelApplications : [];

    const [filter,      setFilter]      = useState('pending');
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason,setRejectReason]= useState('');
    const [allottingId, setAllottingId] = useState(null);
    const [selectedRoom,setSelectedRoom]= useState('');
    const [search,      setSearch]      = useState('');
    const [saving,      setSaving]      = useState(false);

    const filtered = apps.filter(a => {
        const matchStatus = filter==='all' || a.status===filter;
        const matchSearch = !search ||
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.studentId.toLowerCase().includes(search.toLowerCase()) ||
            (a.preferredHostel||'').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const counts = {
        pending:  apps.filter(a=>a.status==='pending').length,
        approved: apps.filter(a=>a.status==='approved').length,
        rejected: apps.filter(a=>a.status==='rejected').length,
    };

    const getPreferredRooms = (app) => rooms.filter(r => r.status==='available' && r.hostel===app.preferredHostel && r.type===app.preferredRoomType);
    const getAllAvailable    = ()    => rooms.filter(r => r.status==='available');

    const handleApprove    = (app) => { setAllottingId(app._id||app.id); setSelectedRoom(''); setRejectingId(null); };
    const handleRejectOpen = (app) => { setRejectingId(app._id||app.id); setRejectReason(''); setAllottingId(null); };

    const confirmAllot = async (app) => {
        if (!selectedRoom) return alert('Please select a room.');
        setSaving(true);
        try {
            await api.applications.approve(app._id||app.id, selectedRoom);
            setAllottingId(null); setSelectedRoom('');
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const confirmReject = async (app) => {
        if (!rejectReason.trim()) return alert('Please provide a rejection reason.');
        setSaving(true);
        try {
            await api.applications.reject(app._id||app.id, rejectReason.trim());
            setRejectingId(null); setRejectReason('');
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

    return (
        <div className="page-content happ-page">
            {/* Summary */}
            <div className="happ-summary">
                {Object.entries(counts).map(([k,v]) => (
                    <div key={k} className={`happ-summary-card happ-${k}`}>
                        <div className="happ-summary-count">{v}</div>
                        <div className="happ-summary-label">{k}</div>
                    </div>
                ))}
            </div>

            {/* Search + filter */}
            <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                <input placeholder="Search by name, ID or hostel..." value={search} onChange={e=>setSearch(e.target.value)}
                    style={{padding:'9px 14px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,flex:1,minWidth:200,fontFamily:'inherit'}}/>
                <div className="happ-filters">
                    {['all','pending','approved','rejected'].map(s=>(
                        <button key={s} className={`happ-filter-btn ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>
                            {s.charAt(0).toUpperCase()+s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications list */}
            <div className="happ-list">
                {filtered.length===0 ? (
                    <div className="empty-state"><div className="empty-icon">📭</div><p>No {filter!=='all'?filter:''} applications.</p></div>
                ) : filtered.map(app => {
                    const id = app._id||app.id;
                    const preferred = getPreferredRooms(app);
                    const allAvail  = getAllAvailable();
                    return (
                        <div key={id} className="happ-card">
                            <div className="happ-card-header">
                                <div className="happ-card-left">
                                    <div className="avatar" style={{width:40,height:40,flexShrink:0}}>{app.name[0]}</div>
                                    <div>
                                        <div className="happ-name">{app.name}</div>
                                        <div className="happ-meta">
                                            <code>{app.studentId}</code>·{app.department}·{app.year} Year·{app.gender}
                                        </div>
                                    </div>
                                </div>
                                <span className="happ-status-badge" style={{background:statusBg[app.status],color:statusColor[app.status]}}>
                                    {app.status==='pending'?'⏳':app.status==='approved'?'✅':'❌'} {app.status}
                                </span>
                            </div>

                            <div className="happ-prefs">
                                <div className="happ-pref-item"><span className="happ-pref-label">Preferred Hostel</span><span className="happ-pref-val">{app.preferredHostel||'—'}</span></div>
                                <div className="happ-pref-item"><span className="happ-pref-label">Room Type</span><span className="happ-pref-val">{app.preferredRoomType||'—'}</span></div>
                                <div className="happ-pref-item"><span className="happ-pref-label">Email</span><span className="happ-pref-val">{app.email}</span></div>
                                <div className="happ-pref-item"><span className="happ-pref-label">Applied</span><span className="happ-pref-val">{fmt(app.appliedDate||app.createdAt)}</span></div>
                            </div>

                            {app.reason && <div className="happ-reason">📝 {app.reason}</div>}

                            {app.status==='approved' && <div className="happ-allotted">✅ Allotted: Room #{app.allottedRoom} — {app.allottedHostel}</div>}
                            {app.status==='rejected' && app.rejectionReason && <div className="happ-rejected">❌ Rejected: {app.rejectionReason}</div>}

                            {/* Allotment panel */}
                            {allottingId===id && (
                                <div className="happ-allot-panel">
                                    <div className="happ-allot-title">Select a room to allot</div>
                                    {preferred.length>0 && (
                                        <div className="happ-room-group">
                                            <div className="happ-room-group-label">✅ Preferred match ({app.preferredHostel} · {app.preferredRoomType})</div>
                                            <div className="happ-room-list">
                                                {preferred.map(r=>(
                                                    <label key={r._id||r.id} className={`happ-room-opt ${selectedRoom===r.number?'selected':''}`}>
                                                        <input type="radio" name="room" value={r.number} checked={selectedRoom===r.number} onChange={()=>setSelectedRoom(r.number)}/>
                                                        <span>Room #{r.number}</span>
                                                        <span className="happ-room-type">{r.type}</span>
                                                        <span className="happ-room-price">₹{r.price}/sem</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {allAvail.filter(r=>!preferred.find(p=>p._id===r._id)).length>0 && (
                                        <div className="happ-room-group">
                                            <div className="happ-room-group-label" style={{color:'#6b7280'}}>Other available rooms</div>
                                            <div className="happ-room-list">
                                                {allAvail.filter(r=>!preferred.find(p=>(p._id||p.id)===(r._id||r.id))).map(r=>(
                                                    <label key={r._id||r.id} className={`happ-room-opt ${selectedRoom===r.number?'selected':''}`}>
                                                        <input type="radio" name="room" value={r.number} checked={selectedRoom===r.number} onChange={()=>setSelectedRoom(r.number)}/>
                                                        <span>Room #{r.number}</span>
                                                        <span className="happ-room-type">{r.type} · {r.hostel}</span>
                                                        <span className="happ-room-price">₹{r.price}/sem</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {allAvail.length===0 && <p style={{color:'#ef4444',fontSize:13}}>No rooms available.</p>}
                                    <div className="happ-card-actions" style={{marginTop:12}}>
                                        <button className="btn-success" onClick={()=>confirmAllot(app)} disabled={!selectedRoom||saving}>{saving?'Approving...':'✅ Confirm Allotment'}</button>
                                        <button className="btn-ghost" onClick={()=>setAllottingId(null)}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* Reject form */}
                            {rejectingId===id && (
                                <div className="reject-form" style={{marginTop:12}}>
                                    <textarea placeholder="Reason for rejection (required)..." value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={2}/>
                                    <div className="form-actions">
                                        <button className="btn-danger" onClick={()=>confirmReject(app)} disabled={saving}>{saving?'Rejecting...':'Confirm Reject'}</button>
                                        <button className="btn-ghost" onClick={()=>setRejectingId(null)}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {app.status==='pending' && allottingId!==id && rejectingId!==id && (
                                <div className="happ-card-actions">
                                    <button className="btn-success" onClick={()=>handleApprove(app)}>✅ Approve &amp; Allot Room</button>
                                    <button className="btn-danger"  onClick={()=>handleRejectOpen(app)}>❌ Reject</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default HostelApplications;
