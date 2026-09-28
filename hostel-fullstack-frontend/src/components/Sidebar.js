import React from 'react';

const icons = {
    dashboard:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    rooms:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    students:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    complaints:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    mess:           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    outpass:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m16 8-3 3 3 3"/></svg>,
    roomchange:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    visitors:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
    notices:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    attendance:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    hostelmanagers:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    hostelapplications: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    feepayment:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    logout:             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const LogoIcon = () => (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <path d="M24 6L4 18v24h12V28h16v14h12V18L24 6z" fill="white"/>
        <rect x="20" y="28" width="8" height="14" rx="1" fill="rgba(255,255,255,0.35)"/>
    </svg>
);

const roleBadge = (role) => {
    if (role === 'super_admin') return '👑 Admin';
    if (role === 'hostel_manager') return '🏠 Hostel Manager';
    return '🎓 Student';
};

const Sidebar = ({ view, setView, user, onLogout, collapsed, setCollapsed, moduleCounts = {} }) => {
    const allMenu = [
        { id: 'dashboard',          label: 'Dashboard',             roles: ['student', 'hostel_manager', 'super_admin'] },
        { id: 'hostelmanagers',     label: 'Hostel Managers',       roles: ['super_admin'] },
        { id: 'hostelapplications', label: 'Hostel Applications',   roles: ['hostel_manager'] },
        { id: 'students',           label: 'Students',              roles: ['hostel_manager', 'super_admin'] },
        { id: 'rooms',              label: 'Rooms',                 roles: ['hostel_manager'] },
        { id: 'complaints',         label: 'Complaints',            roles: ['student', 'hostel_manager'] },
        { id: 'mess',               label: 'Mess',                  roles: ['student', 'hostel_manager'] },
        { id: 'outpass',            label: 'Outpass',               roles: ['student', 'hostel_manager'] },
        { id: 'roomchange',         label: 'Room Change',           roles: ['student', 'hostel_manager'] },
        { id: 'visitors',           label: 'Visitors',              roles: ['student', 'hostel_manager'] },
        { id: 'notices',            label: 'Notices',               roles: ['student', 'hostel_manager'] },
        { id: 'attendance',         label: 'Attendance',            roles: ['student', 'hostel_manager'] },
        { id: 'feepayment',         label: 'Fee Payment',           roles: ['student', 'hostel_manager'] },
    ];

    const menu = allMenu.filter(m => m.roles.includes(user.role));

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="s-header">
                {!collapsed && (
                    <div className="sb-brand">
                        <LogoIcon />
                        <span>HMS</span>
                    </div>
                )}
                <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    }
                </button>
            </div>

            <div className="user">
                <div className="avatar">{user.name[0].toUpperCase()}</div>
                {!collapsed && (
                    <div className="user-info">
                        <div className="name">{user.name}</div>
                        <div className="role-badge">{roleBadge(user.role)}</div>
                    </div>
                )}
            </div>

            <nav>
                {!collapsed && <div className="nav-section-label">Navigation</div>}
                {menu.map(m => {
                    const badge = moduleCounts[m.id] || 0;
                    return (
                    <button key={m.id} className={view === m.id ? 'active' : ''} onClick={() => setView(m.id)} title={collapsed ? m.label : ''}>
                        {icons[m.id]}
                        {!collapsed && <span>{m.label}</span>}
                        {!collapsed && badge > 0 && <span className="nav-badge">{badge}</span>}
                        {collapsed && badge > 0 && <span className="nav-badge-dot"/>}
                        {view === m.id && !collapsed && <span className="nav-active-dot"/>}
                    </button>
                )})}
            </nav>

            <button className="logout" onClick={onLogout} title={collapsed ? 'Logout' : ''}>
                {icons.logout}
                {!collapsed && <span>Logout</span>}
            </button>
        </div>
    );
};

export default Sidebar;
