import React, { useState } from 'react';
import { api, setToken } from '../services/api';

const hostelInfo = {
    name: 'MGIT Hostels',
    established: '2004',
    location: 'Gandipet, Telangana — 500075',
    contact: { warden: '+91 94400 12345', office: '+91 8713 220100', email: 'hostel@svce.edu.in' },
    timings: { 'Gates Close': '10:00 PM', 'Breakfast': '7:00 – 9:00 AM', 'Lunch': '12:00 – 2:00 PM', 'Dinner': '7:00 – 9:00 PM' },
    hostels: [
        { name: 'Boys Hostel A',  capacity: 120, rooms: 48, type: 'Boys',  icon: '🏢' },
        { name: 'Girls Hostel B', capacity: 80,  rooms: 36, type: 'Girls', icon: '🏠' },
    ],
    amenities: ['📶 24/7 Wi-Fi','🔒 CCTV Security','🚿 Hot Water','🍽️ Mess Facility','📚 Study Room','🏋️ Gym','🚑 Medical Aid','🔌 Power Backup'],
};

const HOSTELS     = ['Boys Hostel A','Girls Hostel B'];
const ROOM_TYPES  = ['Single','Double','Triple'];
const DEPARTMENTS = ['Computer Science','Electrical Eng','Mechanical Eng','Civil Eng','Electronics','Information Technology','Other'];
const YEARS       = ['1st','2nd','3rd','4th'];
const emptyApp    = { name:'',email:'',password:'',confirmPassword:'',phone:'',studentId:'',department:'',year:'1st',gender:'',preferredHostel:'Boys Hostel A',preferredRoomType:'Double',reason:'' };

const Login = ({ onLogin }) => {
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [role,     setRole]     = useState('student');
    const [showPass, setShowPass] = useState(false);
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    const [showApply,   setShowApply]   = useState(false);
    const [appForm,     setAppForm]     = useState(emptyApp);
    const [appErrors,   setAppErrors]   = useState({});
    const [appSuccess,  setAppSuccess]  = useState(false);
    const [appLoading,  setAppLoading]  = useState(false);
    const [showAppPass, setShowAppPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await api.auth.login(email, password, role);
            setToken(res.token);
            await onLogin(res.user);
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (r) => {
        setRole(r);
        if (r === 'super_admin')    { setEmail('superadmin@college.edu'); setPassword('superadmin123'); }
        else if (r === 'hostel_manager') { setEmail('manager@college.edu');   setPassword('manager123');    }
        else                        { setEmail('john@college.edu');        setPassword('student123');    }
        setError('');
    };

    const validateApp = () => {
        const e = {};
        if (!appForm.name.trim())     e.name     = 'Required';
        if (!appForm.email.trim())    e.email    = 'Required';
        else if (!/\S+@\S+\.\S+/.test(appForm.email)) e.email = 'Invalid email';
        if (!appForm.password.trim()) e.password = 'Required';
        else if (appForm.password.length < 6) e.password = 'Min 6 characters';
        if (appForm.password !== appForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
        if (!appForm.studentId.trim()) e.studentId  = 'Required';
        if (!appForm.gender)           e.gender     = 'Required';
        if (!appForm.department)       e.department = 'Required';
        setAppErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleApplySubmit = async () => {
        if (!validateApp()) return;
        setAppLoading(true);
        try {
            await api.applications.apply({
                name: appForm.name, email: appForm.email, password: appForm.password,
                phone: appForm.phone, studentId: appForm.studentId,
                department: appForm.department, year: appForm.year,
                gender: appForm.gender, preferredHostel: appForm.preferredHostel,
                preferredRoomType: appForm.preferredRoomType, reason: appForm.reason,
            });
            setAppSuccess(true);
        } catch (err) {
            setAppErrors({ submit: err.message });
        } finally {
            setAppLoading(false);
        }
    };

    const roleOptions = [
        { id: 'student',        label: 'Student',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
        { id: 'hostel_manager', label: 'Hostel Manager', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
        { id: 'super_admin',    label: 'Admin',          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    ];

    return (
        <>
        <div className="login">
            <div className="login-left">
                <div className="login-left-inner">
                    <div className="ll-logo">
                        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                            <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)"/>
                            <path d="M24 10L8 20v18h10v-10h12v10h10V20L24 10z" fill="white"/>
                            <rect x="20" y="28" width="8" height="10" rx="1" fill="rgba(255,255,255,0.4)"/>
                        </svg>
                        <span>HMS</span>
                    </div>
                    <h1 style={{ fontSize:26, fontWeight:800, lineHeight:1.25, marginBottom:4 }}>{hostelInfo.name}</h1>
                    <p style={{ fontSize:13, opacity:0.7, marginBottom:20 }}>Est. {hostelInfo.established} · {hostelInfo.location}</p>
                    <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                        {hostelInfo.hostels.map(h => (
                            <div key={h.name} style={{ flex:1, background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 14px' }}>
                                <div style={{ fontSize:22, marginBottom:4 }}>{h.icon}</div>
                                <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{h.name}</div>
                                <div style={{ fontSize:11, opacity:0.7 }}>{h.capacity} students · {h.rooms} rooms</div>
                                <div style={{ marginTop:6, fontSize:11, background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'2px 8px', display:'inline-block' }}>{h.type} Only</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
                        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', opacity:0.6, marginBottom:10 }}>⏰ Timings</div>
                        {Object.entries(hostelInfo.timings).map(([k,v]) => (
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                                <span style={{ opacity:0.75 }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom:16 }}>
                        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', opacity:0.6, marginBottom:8 }}>🛎️ Amenities</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {hostelInfo.amenities.map(a => (
                                <span key={a} style={{ background:'rgba(255,255,255,0.13)', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{a}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px' }}>
                        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', opacity:0.6, marginBottom:8 }}>📞 Contact</div>
                        {Object.entries(hostelInfo.contact).map(([k,v]) => (
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                                <span style={{ opacity:0.7, textTransform:'capitalize' }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-box">
                    <div className="lb-header"><h2>Sign in</h2><p className="sub">Access your hostel dashboard</p></div>
                    <div className="role-toggle role-toggle-3">
                        {roleOptions.map(opt => (
                            <button key={opt.id} type="button"
                                className={`role-opt ${role === opt.id ? 'active' : ''}`}
                                onClick={() => { setRole(opt.id); setError(''); }}>
                                {opt.icon}{opt.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label>Email address</label>
                            <div className="input-wrap">
                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                <input type="email" placeholder="you@college.edu" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required />
                            </div>
                        </div>
                        <div className="field">
                            <label>Password</label>
                            <div className="input-wrap">
                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} required />
                                <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                                </button>
                            </div>
                        </div>
                        {role === 'student' && <div className="login-hint">💡 Applied for hostel? Use your application email &amp; password to check status.</div>}
                        {error && <div className="login-error">⚠️ {error}</div>}
                        <button type="submit" className="btn-signin" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                            {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                        </button>
                    </form>
                    <div className="apply-hostel-section">
                        <div className="apply-divider"><span>New student?</span></div>
                        <button className="btn-apply-hostel" onClick={() => { setShowApply(true); setAppSuccess(false); setAppForm(emptyApp); setAppErrors({}); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Apply for Hostel Admission
                        </button>
                    </div>
                    <div className="demo-section">
                        <div className="demo-label">Quick demo access</div>
                        <div className="demo-btns">
                            <button className="demo-btn" onClick={() => fillDemo('super_admin')}>👑 Fill Admin</button>
                            <button className="demo-btn" onClick={() => fillDemo('hostel_manager')}>🏠 Fill Manager</button>
                            <button className="demo-btn" onClick={() => fillDemo('student')}>🎓 Fill Student</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showApply && (
            <div className="modal-overlay" onClick={() => setShowApply(false)}>
                <div className="apply-modal" onClick={e => e.stopPropagation()}>
                    <div className="apply-modal-header">
                        <div className="apply-modal-title">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            <h3>Apply for Hostel Admission</h3>
                        </div>
                        <button className="hm-close" onClick={() => setShowApply(false)}>✕</button>
                    </div>
                    {appSuccess ? (
                        <div className="apply-success">
                            <div className="apply-success-icon">✅</div>
                            <h3>Application Submitted!</h3>
                            <p>Your application has been submitted. You can now <strong>log in using your email and password</strong> (select Student) to track your application status.</p>
                            <div className="apply-success-detail">
                                <span>📧 Login Email: <strong>{appForm.email}</strong></span>
                                <span>🏠 Preferred: <strong>{appForm.preferredHostel}</strong></span>
                            </div>
                            <button className="btn-primary" style={{ marginTop:20, width:'100%' }} onClick={() => setShowApply(false)}>Close &amp; Login</button>
                        </div>
                    ) : (
                        <>
                        <p className="apply-modal-sub">Fill in your details. After submitting, use your email &amp; password to log in and track your application.</p>
                        {appErrors.submit && <div className="login-error">⚠️ {appErrors.submit}</div>}
                        <div className="apply-form-grid">
                            <div className="field"><label>Full Name *</label><input placeholder="e.g. Ravi Kumar" value={appForm.name} onChange={e => setAppForm({...appForm, name:e.target.value})} />{appErrors.name && <span className="field-error">{appErrors.name}</span>}</div>
                            <div className="field"><label>Email *</label><input type="email" placeholder="you@college.edu" value={appForm.email} onChange={e => setAppForm({...appForm, email:e.target.value})} />{appErrors.email && <span className="field-error">{appErrors.email}</span>}</div>
                            <div className="field"><label>Password *</label>
                                <div className="input-wrap">
                                    <input type={showAppPass ? 'text' : 'password'} placeholder="Min 6 characters" value={appForm.password} onChange={e => setAppForm({...appForm, password:e.target.value})} />
                                    <button type="button" className="show-pass" onClick={() => setShowAppPass(!showAppPass)}>{showAppPass ? '🙈' : '👁️'}</button>
                                </div>
                                {appErrors.password && <span className="field-error">{appErrors.password}</span>}
                            </div>
                            <div className="field"><label>Confirm Password *</label><input type="password" placeholder="Re-enter password" value={appForm.confirmPassword} onChange={e => setAppForm({...appForm, confirmPassword:e.target.value})} />{appErrors.confirmPassword && <span className="field-error">{appErrors.confirmPassword}</span>}</div>
                            <div className="field"><label>Student ID *</label><input placeholder="e.g. CS2025001" value={appForm.studentId} onChange={e => setAppForm({...appForm, studentId:e.target.value})} />{appErrors.studentId && <span className="field-error">{appErrors.studentId}</span>}</div>
                            <div className="field"><label>Phone</label><input placeholder="+91 9000000000" value={appForm.phone} onChange={e => setAppForm({...appForm, phone:e.target.value})} /></div>
                            <div className="field"><label>Gender *</label><select value={appForm.gender} onChange={e => setAppForm({...appForm, gender:e.target.value})}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select>{appErrors.gender && <span className="field-error">{appErrors.gender}</span>}</div>
                            <div className="field"><label>Department *</label><select value={appForm.department} onChange={e => setAppForm({...appForm, department:e.target.value})}><option value="">Select department</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select>{appErrors.department && <span className="field-error">{appErrors.department}</span>}</div>
                            <div className="field"><label>Year</label><select value={appForm.year} onChange={e => setAppForm({...appForm, year:e.target.value})}>{YEARS.map(y => <option key={y}>{y} Year</option>)}</select></div>
                            <div className="field"><label>Preferred Hostel</label><select value={appForm.preferredHostel} onChange={e => setAppForm({...appForm, preferredHostel:e.target.value})}>{HOSTELS.map(h => <option key={h}>{h}</option>)}</select></div>
                            <div className="field"><label>Preferred Room Type</label><select value={appForm.preferredRoomType} onChange={e => setAppForm({...appForm, preferredRoomType:e.target.value})}>{ROOM_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                            <div className="field" style={{ gridColumn:'1/-1' }}><label>Reason / Additional Info</label><textarea placeholder="Any special requirements..." value={appForm.reason} onChange={e => setAppForm({...appForm, reason:e.target.value})} rows={3} style={{ resize:'vertical' }} /></div>
                        </div>
                        <div className="hm-form-actions">
                            <button className="btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleApplySubmit} disabled={appLoading}>
                                {appLoading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                        </>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default Login;
