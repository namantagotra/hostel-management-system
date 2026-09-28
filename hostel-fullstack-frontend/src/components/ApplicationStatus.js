import React from 'react';

const ApplicationStatus = ({ user, onLogout }) => {
    const statusMap = {
        pending:  { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⏳', label: 'Under Review' },
        approved: { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: '✅', label: 'Approved'     },
        rejected: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '❌', label: 'Rejected'     },
    };
    const s = statusMap[user.status] || statusMap.pending;

    return (
        <div className="appstatus-page">
            <div className="appstatus-card">
                {/* Header */}
                <div className="appstatus-header">
                    <div className="appstatus-logo">
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                            <rect width="48" height="48" rx="14" fill="var(--primary)"/>
                            <path d="M24 10L8 20v18h10v-10h12v10h10V20L24 10z" fill="white"/>
                        </svg>
                        <span>HMS</span>
                    </div>
                    <button className="appstatus-logout" onClick={onLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>

                {/* Greeting */}
                <div className="appstatus-greeting">
                    <div className="appstatus-avatar">{user.name[0].toUpperCase()}</div>
                    <div>
                        <h2>Hello, {user.name}!</h2>
                        <p>Here's the status of your hostel application.</p>
                    </div>
                </div>

                {/* Status banner */}
                <div className="appstatus-banner" style={{ background: s.bg, border: `2px solid ${s.border}` }}>
                    <div className="appstatus-icon">{s.icon}</div>
                    <div>
                        <div className="appstatus-status-label" style={{ color: s.color }}>Application {s.label}</div>
                        {user.status === 'pending' && (
                            <p className="appstatus-desc">Your application is being reviewed by the hostel manager. You'll be notified once a decision is made. Please check back later.</p>
                        )}
                        {user.status === 'approved' && (
                            <p className="appstatus-desc">🎉 Congratulations! Your application has been approved. You have been allotted <strong>Room #{user.allottedRoom}</strong> in <strong>{user.allottedHostel}</strong>. Please log out and log back in to access your full hostel dashboard.</p>
                        )}
                        {user.status === 'rejected' && (
                            <p className="appstatus-desc">We're sorry, your application was not approved at this time. You may apply again or contact the hostel office for more information.</p>
                        )}
                    </div>
                </div>

                {/* Rejection reason */}
                {user.status === 'rejected' && user.rejectionReason && (
                    <div className="appstatus-rejection">
                        <div className="appstatus-rej-label">Reason given by manager:</div>
                        <div className="appstatus-rej-text">"{user.rejectionReason}"</div>
                    </div>
                )}

                {/* Application details */}
                <div className="appstatus-details">
                    <div className="appstatus-details-title">Application Details</div>
                    <div className="appstatus-grid">
                        {[
                            { label: 'Student ID',       val: user.studentId },
                            { label: 'Department',       val: user.department },
                            { label: 'Year',             val: user.year + ' Year' },
                            { label: 'Gender',           val: user.gender || '—' },
                            { label: 'Preferred Hostel', val: user.preferredHostel },
                            { label: 'Room Type',        val: user.preferredRoomType },
                            { label: 'Applied On',       val: user.appliedDate },
                            { label: 'Email',            val: user.email },
                            ...(user.allottedRoom ? [
                                { label: 'Allotted Room',   val: '#' + user.allottedRoom },
                                { label: 'Allotted Hostel', val: user.allottedHostel },
                                { label: 'Approved On',     val: user.approvedDate },
                            ] : []),
                        ].map(({ label, val }) => (
                            <div key={label} className="appstatus-detail-item">
                                <div className="appstatus-detail-label">{label}</div>
                                <div className="appstatus-detail-val">{val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {user.status === 'approved' && (
                    <div className="appstatus-tip">
                        💡 <strong>Tip:</strong> Log out and sign in again with the <strong>Student</strong> role using your email and password to access your full hostel dashboard.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationStatus;
