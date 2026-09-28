import React, { useState } from 'react';
import { api } from '../services/api';

const MEALS = ['breakfast','lunch','dinner'];
const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const emoji = { 1:'😞',2:'😐',3:'🙂',4:'😊',5:'😍' };
const ratingLabel = { 1:'Terrible',2:'Poor',3:'Okay',4:'Good',5:'Excellent' };
const mealIcon = { breakfast:'🌅',lunch:'☀️',dinner:'🌙' };
const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : null;
const ratingColor = r => { if(!r) return '#a0aec0'; if(r>=4) return '#22c55e'; if(r>=3) return '#f59e0b'; return '#ef4444'; };

const StarRating = ({ value, onChange }) => (
    <div style={{ display:'flex',gap:4,alignItems:'center' }}>
        {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => onChange(n)}
                style={{ background:'none',border:'none',cursor:'pointer',fontSize:22,opacity:n<=value?1:0.2,transition:'opacity 0.15s',padding:0 }}>★</button>
        ))}
        {value>0 && <span style={{ fontSize:12,color:'#718096',marginLeft:4 }}>{emoji[value]} {ratingLabel[value]}</span>}
    </div>
);

const Mess = ({ messSchedule, messFeedback, role, user, reload }) => {
    const [tab,         setTab]         = useState('schedule');
    const [editingId,   setEditingId]   = useState(null);
    const [editForm,    setEditForm]    = useState({});
    const [ratings,     setRatings]     = useState({ breakfast:0,lunch:0,dinner:0 });
    const [comment,     setComment]     = useState('');
    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()===0?6:new Date().getDay()-1]);
    const [saving,      setSaving]      = useState(false);

    const today    = new Date().toISOString().split('T')[0];
    const todayDay = DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
    const todayMenu = messSchedule.find(m => m.day===todayDay);
    const myTodayFeedback = messFeedback && messFeedback.find(f => f.studentId===user.studentId && (f.date||'').startsWith(today));

    const startEdit = m => { setEditingId(m._id||m.id); setEditForm({ breakfast:m.breakfast,lunch:m.lunch,dinner:m.dinner }); };
    const cancelEdit = () => { setEditingId(null); setEditForm({}); };

    const saveEdit = async (id) => {
        if (!editForm.breakfast.trim()||!editForm.lunch.trim()||!editForm.dinner.trim()) return alert('All meal fields are required.');
        try { await api.mess.updateSchedule(id, editForm); setEditingId(null); await reload(); }
        catch (err) { alert(err.message); }
    };

    const submitFeedback = async () => {
        if (!ratings.breakfast&&!ratings.lunch&&!ratings.dinner) return alert('Please rate at least one meal.');
        setSaving(true);
        try {
            await api.mess.submitFeedback({ day:todayDay, breakfast:ratings.breakfast, lunch:ratings.lunch, dinner:ratings.dinner, comment:comment.trim() });
            setRatings({ breakfast:0,lunch:0,dinner:0 }); setComment('');
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const daySummary = DAYS.map(day => {
        const fb = messFeedback?messFeedback.filter(f=>f.day===day):[];
        return { day, count:fb.length, breakfast:avg(fb.filter(f=>f.breakfast>0).map(f=>f.breakfast)), lunch:avg(fb.filter(f=>f.lunch>0).map(f=>f.lunch)), dinner:avg(fb.filter(f=>f.dinner>0).map(f=>f.dinner)) };
    });
    const selectedDayFeedbacks = messFeedback?messFeedback.filter(f=>f.day===selectedDay):[];

    return (
        <div className="page-content">
            <div className="mess-tabs">
                <button className={`mess-tab ${tab==='schedule'?'active':''}`} onClick={() => setTab('schedule')}>🍽️ Weekly Schedule</button>
                <button className={`mess-tab ${tab==='feedback'?'active':''}`} onClick={() => setTab('feedback')}>⭐ {role==='hostel_manager'?'Feedback Summary':'My Feedback'}</button>
            </div>

            {tab==='schedule' && (
                <>
                    {role==='hostel_manager' && <p style={{color:'#718096',fontSize:13,marginBottom:8}}>Click Edit on any day to update the menu.</p>}
                    <div className="card">
                        <table>
                            <thead><tr><th>Day</th><th>🌅 Breakfast</th><th>☀️ Lunch</th><th>🌙 Dinner</th>{role==='hostel_manager'&&<th>Action</th>}</tr></thead>
                            <tbody>
                                {messSchedule.map(m => (
                                    <tr key={m._id||m.id} style={m.day===todayDay?{background:'#f0fdf4'}:{}}>
                                        <td><b>{m.day}</b>{m.day===todayDay&&<span style={{marginLeft:6,fontSize:10,background:'#22c55e',color:'white',borderRadius:4,padding:'2px 6px',fontWeight:700}}>TODAY</span>}</td>
                                        {editingId===(m._id||m.id) ? (
                                            <>
                                                <td><input className="mess-input" value={editForm.breakfast} onChange={e=>setEditForm({...editForm,breakfast:e.target.value})}/></td>
                                                <td><input className="mess-input" value={editForm.lunch} onChange={e=>setEditForm({...editForm,lunch:e.target.value})}/></td>
                                                <td><input className="mess-input" value={editForm.dinner} onChange={e=>setEditForm({...editForm,dinner:e.target.value})}/></td>
                                                <td><button className="tbl-btn save" onClick={() => saveEdit(m._id||m.id)}>Save</button><button className="tbl-btn cancel" onClick={cancelEdit}>Cancel</button></td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{m.breakfast}</td><td>{m.lunch}</td><td>{m.dinner}</td>
                                                {role==='hostel_manager'&&<td><button className="tbl-btn edit" onClick={()=>startEdit(m)}>✏️ Edit</button></td>}
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab==='feedback' && role==='student' && (
                <>
                    {!myTodayFeedback ? (
                        <div className="form-card">
                            <h3>🍽️ Rate Today's Meals — {todayDay}</h3>
                            {todayMenu && (
                                <div className="mf-today-menu">
                                    {MEALS.map(m => <div key={m} className="mf-menu-item"><span>{mealIcon[m]} {m.charAt(0).toUpperCase()+m.slice(1)}</span><span>{todayMenu[m]}</span></div>)}
                                </div>
                            )}
                            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:16}}>
                                {MEALS.map(m => (
                                    <div key={m}>
                                        <div style={{fontSize:13,fontWeight:600,color:'#4a5568',marginBottom:6,textTransform:'capitalize'}}>{mealIcon[m]} {m}</div>
                                        <StarRating value={ratings[m]} onChange={v=>setRatings({...ratings,[m]:v})}/>
                                    </div>
                                ))}
                            </div>
                            <div className="form-row"><label>Comment (optional)</label><textarea rows={2} placeholder="Any specific feedback..." value={comment} onChange={e=>setComment(e.target.value)}/></div>
                            <div className="form-actions"><button className="btn-primary" onClick={submitFeedback} disabled={saving}>{saving?'Submitting...':'Submit Feedback'}</button></div>
                        </div>
                    ) : (
                        <div className="form-card" style={{textAlign:'center',padding:28}}>
                            <div style={{fontSize:44,marginBottom:10}}>✅</div>
                            <h3 style={{marginBottom:6}}>Feedback submitted for today!</h3>
                            <p style={{color:'#718096',fontSize:13,marginBottom:14}}>Come back tomorrow to rate again.</p>
                            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
                                {MEALS.map(m => myTodayFeedback[m]>0&&<span key={m} className="mf-rating-chip" style={{color:ratingColor(myTodayFeedback[m])}}>{mealIcon[m]} {emoji[myTodayFeedback[m]]} {myTodayFeedback[m]}/5</span>)}
                            </div>
                        </div>
                    )}
                    <div className="card" style={{padding:20}}>
                        <h3 style={{marginBottom:14,fontSize:15,color:'#2d3748'}}>My Past Feedback</h3>
                        {messFeedback.filter(f=>f.studentId===user.studentId).length===0 ? <p className="empty">No feedback submitted yet.</p>
                        : messFeedback.filter(f=>f.studentId===user.studentId).map(f => (
                            <div key={f._id||f.id} className="mf-feedback-item">
                                <div className="mf-fb-header"><strong>{f.day}</strong><span className="complaint-date">{new Date(f.date||f.createdAt).toLocaleDateString()}</span></div>
                                <div className="mf-ratings-row">{MEALS.map(m=>f[m]>0&&<span key={m} className="mf-rating-chip" style={{color:ratingColor(f[m])}}>{mealIcon[m]} {emoji[f[m]]} {f[m]}/5</span>)}</div>
                                {f.comment&&<p className="mf-comment">"{f.comment}"</p>}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {tab==='feedback' && role==='hostel_manager' && (
                <>
                    <div className="mf-summary-grid">
                        {daySummary.map(ds => (
                            <div key={ds.day} className={`mf-day-card ${selectedDay===ds.day?'mf-day-active':''}`} onClick={()=>setSelectedDay(ds.day)}>
                                <div className="mf-day-name">{ds.day.slice(0,3)}</div>
                                <div className="mf-count">{ds.count} {ds.count===1?'review':'reviews'}</div>
                                {MEALS.map(m=><div key={m} className="mf-meal-row"><span>{mealIcon[m]}</span><span style={{color:ratingColor(ds[m]),fontWeight:600}}>{ds[m]||'—'}</span></div>)}
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{padding:20}}>
                        <h3 style={{marginBottom:14,fontSize:15,color:'#2d3748'}}>{selectedDay} — {selectedDayFeedbacks.length} feedback{selectedDayFeedbacks.length!==1?'s':''}</h3>
                        {selectedDayFeedbacks.length===0 ? <p className="empty">No feedback for {selectedDay} yet.</p>
                        : selectedDayFeedbacks.map(f => (
                            <div key={f._id||f.id} className="mf-feedback-item">
                                <div className="mf-fb-header"><strong>{f.studentName}</strong><span className="complaint-date">{new Date(f.date||f.createdAt).toLocaleDateString()}</span></div>
                                <div className="mf-ratings-row">{MEALS.map(m=>f[m]>0&&<span key={m} className="mf-rating-chip" style={{color:ratingColor(f[m])}}>{mealIcon[m]} {m}: {emoji[f[m]]} {f[m]}/5</span>)}</div>
                                {f.comment&&<p className="mf-comment">"{f.comment}"</p>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
export default Mess;
