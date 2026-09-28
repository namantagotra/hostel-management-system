import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Rooms from './components/Rooms';
import Students from './components/Students';
import Complaints from './components/Complaints';
import Mess from './components/Mess';
import Outpass from './components/Outpass';
import RoomChange from './components/RoomChange';
import Visitors from './components/Visitors';
import Notices from './components/Notices';
import Attendance from './components/Attendance';
import Login from './components/Login';
import HostelManagers from './components/HostelManagers';
import HostelApplications from './components/HostelApplications';
import ApplicationStatus from './components/ApplicationStatus';
import FeePayment from './components/FeePayment';
import { api, getToken, setToken, clearToken } from './services/api';
import { pageConfig } from './utils/helpers';
import './styles/app.css';

const emptyState = {
    rooms: [], students: [], complaints: [], messSchedule: [],
    outpasses: [], notices: [], attendance: [], roomChanges: [],
    visitors: [], messFeedback: [], hostelManagers: [],
    hostelApplications: [], feePayments: [], feeStructures: [],
};

const managerBadgeModules = [
    'hostelapplications',
    'students',
    'rooms',
    'complaints',
    'mess',
    'outpass',
    'roomchange',
    'visitors',
    'notices',
    'attendance',
    'feepayment',
];

const getSeenStorageKey = (user) => `managerSeenModules:${user.email || user._id || 'default'}`;

const readSeenMap = (user) => {
    if (!user || user.role !== 'hostel_manager') return {};
    try {
        return JSON.parse(localStorage.getItem(getSeenStorageKey(user)) || '{}');
    } catch {
        return {};
    }
};

const toMs = (value) => {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const countNewItems = (items = [], lastSeen = 0, predicate = () => true) =>
    items.filter(item => predicate(item) && toMs(item.createdAt || item.updatedAt || item.date) > lastSeen).length;

function App() {
    const [user,      setUser]      = useState(null);
    const [view,      setView]      = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [state,     setState]     = useState(emptyState);
    const [loading,   setLoading]   = useState(true);
    const [seenModules, setSeenModules] = useState({});

    const loadAll = useCallback(async (role) => {
        try {
            const [rooms, notices, mess, fees] = await Promise.all([
                api.rooms.getAll(), api.notices.getAll(),
                api.mess.getSchedule(), api.fees.getStructure(),
            ]);
            setState(prev => ({
                ...prev,
                rooms: rooms.data, notices: notices.data,
                messSchedule: mess.data, feeStructures: fees.data,
            }));

            const isAdmin   = role === 'hostel_manager' || role === 'super_admin';
            const isStudent = role === 'student';
            const isApplicant = role === 'applicant';

            if (isAdmin) {
                const [students, complaints, outpasses, attendance,
                       visitors, roomChanges, hostelApplications,
                       feePayments, messFeedback] = await Promise.all([
                    api.students.getAll(), api.complaints.getAll(),
                    api.outpasses.getAll(), api.attendance.getAll(),
                    api.visitors.getAll(), api.roomChanges.getAll(),
                    api.applications.getAll(), api.fees.getPayments(),
                    api.mess.getFeedback(),
                ]);
                setState(prev => ({
                    ...prev,
                    students: students.data, complaints: complaints.data,
                    outpasses: outpasses.data, attendance: attendance.data,
                    visitors: visitors.data, roomChanges: roomChanges.data,
                    hostelApplications: hostelApplications.data,
                    feePayments: feePayments.data, messFeedback: messFeedback.data,
                }));
                if (role === 'super_admin') {
                    const managers = await api.managers.getAll();
                    setState(prev => ({ ...prev, hostelManagers: managers.data }));
                }
            }

            if (isStudent) {
                const [complaints, outpasses, attendance, visitors,
                       roomChanges, feePayments, messFeedback, studentsRes] = await Promise.all([
                    api.complaints.getAll(), api.outpasses.getAll(),
                    api.attendance.getAll(), api.visitors.getAll(),
                    api.roomChanges.getAll(), api.fees.getPayments(),
                    api.mess.getFeedback(), api.students.getAll(),
                ]);
                setState(prev => ({
                    ...prev,
                    students: studentsRes.data, complaints: complaints.data,
                    outpasses: outpasses.data, attendance: attendance.data,
                    visitors: visitors.data, roomChanges: roomChanges.data,
                    feePayments: feePayments.data, messFeedback: messFeedback.data,
                }));
            }

            if (isApplicant) {
                const [hostelApplications, studentsRes] = await Promise.all([
                    api.applications.getAll(), api.students.getAll(),
                ]);
                setState(prev => ({
                    ...prev,
                    hostelApplications: hostelApplications.data,
                    students: studentsRes.data,
                }));
            }
        } catch (err) {
            console.error('Load error:', err.message);
        }
    }, []);

    // ── Restore session on page load ──────────────────
    useEffect(() => {
        const token = getToken();
        if (!token) { setLoading(false); return; }
        api.auth.me()
            .then(res => { setUser(res.user); return loadAll(res.user.role); })
            .catch(() => clearToken())
            .finally(() => setLoading(false));
    }, [loadAll]);

    useEffect(() => {
        setSeenModules(readSeenMap(user));
    }, [user]);

    useEffect(() => {
        if (!user || user.role !== 'hostel_manager') return;
        if (!managerBadgeModules.includes(view)) return;

        const now = Date.now();
        const currentSeen = readSeenMap(user);
        if ((currentSeen[view] || 0) >= now - 1000) return;

        const nextSeen = { ...currentSeen, [view]: now };
        localStorage.setItem(getSeenStorageKey(user), JSON.stringify(nextSeen));
        setSeenModules(nextSeen);
    }, [user, view]);

    const handleLogin  = async (loggedInUser) => { setUser(loggedInUser); await loadAll(loggedInUser.role); };
    const handleLogout = () => { clearToken(); setUser(null); setView('dashboard'); setState(emptyState); };

    // ── Loading spinner ───────────────────────────────
    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16, background:'#f0f2f8' }}>
            <div style={{ width:48, height:48, border:'4px solid #e8eaf6', borderTop:'4px solid #5c6bc0', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <p style={{ color:'#718096', fontWeight:600 }}>Loading HMS...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!user) return <Login onLogin={handleLogin} />;

    // ── Applicant view ────────────────────────────────
    if (user.role === 'applicant') {
        const latestApp = state.hostelApplications.find(
            a => a.email === user.email || a.studentId === user.studentId
        ) || user;

        // Approved — auto-login as student directly
        if (latestApp.status === 'approved') {
            const fullStudent = state.students.find(s => s.studentId === latestApp.studentId);
            if (fullStudent) {
                // ✅ Silently promote: re-login using stored credentials
                // Get a fresh student token by calling login again with stored email
                const autoPromote = async () => {
                    try {
                        // Re-issue token as student role
                        const res = await api.auth.login(user.email, user.password || '', 'student');
                        setToken(res.token);
                        setUser({ ...res.user, role: 'student' });
                        await loadAll('student');
                    } catch {
                        // If auto-login fails, show the student dashboard directly
                        setUser({ ...fullStudent, role: 'student' });
                        await loadAll('student');
                    }
                };

                return (
                    <div className="app">
                        <Sidebar view={view} setView={setView}
                            user={{ ...fullStudent, role: 'student' }}
                            onLogout={handleLogout} collapsed={collapsed}
                            setCollapsed={setCollapsed} moduleCounts={{}} />
                        <div className={`main ${collapsed ? 'expanded' : ''}`}>
                            <div className="header">
                                <h1>{pageConfig[view]?.title}</h1>
                                <p>{pageConfig[view]?.desc}</p>
                            </div>
                            {/* Show promoted student dashboard immediately */}
                            {buildViews({ ...fullStudent, role:'student' }, state, loadAll, setState)[view]
                                || <Dashboard user={{ ...fullStudent, role:'student' }} {...state} />}
                        </div>
                    </div>
                );
            }

            // Student record not ready yet — show approval screen with auto-refresh
            return <ApprovalPending onLogout={handleLogout} reload={() => loadAll('applicant')} />;
        }

        return <ApplicationStatus user={latestApp} onLogout={handleLogout} />;
    }

    // ── Normal logged-in user ─────────────────────────
    const currentUser = user.role === 'student'
        ? { ...user, ...(state.students.find(s => s.studentId === user.studentId) || {}) }
        : user;

    const moduleCounts = currentUser.role === 'hostel_manager'
        ? {
            hostelapplications: countNewItems(state.hostelApplications, seenModules.hostelapplications, a => a.status === 'pending'),
            students: countNewItems(state.students, seenModules.students),
            rooms: countNewItems(state.rooms, seenModules.rooms),
            complaints: countNewItems(state.complaints, seenModules.complaints, c => c.status === 'pending'),
            mess: countNewItems(state.messFeedback, seenModules.mess),
            outpass: countNewItems(state.outpasses, seenModules.outpass, o => o.status === 'pending'),
            roomchange: countNewItems(state.roomChanges, seenModules.roomchange, r => r.status === 'pending'),
            visitors: countNewItems(state.visitors, seenModules.visitors, v => v.status === 'pending'),
            notices: countNewItems(state.notices, seenModules.notices),
            attendance: countNewItems(state.attendance, seenModules.attendance),
            feepayment: countNewItems(state.feePayments, seenModules.feepayment, p => p.status === 'pending'),
        }
        : {};

    return (
        <div className="app">
            <Sidebar view={view} setView={setView} user={currentUser}
                onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed}
                moduleCounts={moduleCounts} />
            <div className={`main ${collapsed ? 'expanded' : ''}`}>
                <div className="header">
                    <h1>{pageConfig[view]?.title}</h1>
                    <p>{pageConfig[view]?.desc}</p>
                </div>
                {buildViews(currentUser, state, loadAll, setState)[view]}
            </div>
        </div>
    );
}

// ── Auto-refresh screen when student record isn't ready yet ───────────────
function ApprovalPending({ onLogout, reload }) {
    useEffect(() => {
        const t = setInterval(reload, 3000); // poll every 3s
        return () => clearInterval(t);
    }, [reload]);
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:16, background:'#f0f2f8', fontFamily:'inherit' }}>
            <div style={{ fontSize:48 }}>🎉</div>
            <h2 style={{ color:'#2d3748', margin:0 }}>Application Approved!</h2>
            <p style={{ color:'#718096', textAlign:'center', maxWidth:360 }}>
                Setting up your student account... This will load automatically in a moment.
            </p>
            <div style={{ width:36, height:36, border:'4px solid #e8eaf6', borderTop:'4px solid #5c6bc0', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <button onClick={onLogout} style={{ marginTop:8, padding:'8px 24px', background:'transparent', color:'#718096', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                Log out instead
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

// ── Build view map ────────────────────────────────────
function buildViews(user, state, loadAll, setState) {
    const reload = () => loadAll(user.role);
    return {
        dashboard:          <Dashboard user={user} {...state} feePayments={state.feePayments} feeStructures={state.feeStructures} />,
        rooms:              <Rooms rooms={state.rooms} reload={reload} />,
        students:           <Students students={state.students} rooms={state.rooms} feePayments={state.feePayments} reload={reload} />,
        complaints:         <Complaints complaints={state.complaints} user={user} reload={reload} />,
        mess:               <Mess messSchedule={state.messSchedule} messFeedback={state.messFeedback} role={user.role} user={user} reload={reload} />,
        outpass:            <Outpass outpasses={state.outpasses} user={user} reload={reload} />,
        roomchange:         <RoomChange roomChanges={state.roomChanges} rooms={state.rooms} students={state.students} user={user} reload={reload} />,
        visitors:           <Visitors visitors={state.visitors} user={user} reload={reload} />,
        notices:            <Notices notices={state.notices} role={user.role} reload={reload} />,
        attendance:         <Attendance attendance={state.attendance} user={user} reload={reload} />,
        hostelmanagers:     <HostelManagers hostelManagers={state.hostelManagers} students={state.students} reload={reload} />,
        hostelapplications: <HostelApplications hostelApplications={state.hostelApplications} rooms={state.rooms} students={state.students} reload={reload} />,
        feepayment:         <FeePayment feePayments={state.feePayments} feeStructures={state.feeStructures}
                                setFeeStructures={val => setState(prev => ({ ...prev, feeStructures: val }))}
                                students={state.students} user={user} reload={reload} />,
    };
}

export default App;
