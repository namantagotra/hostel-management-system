import React from 'react';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const Dashboard = ({ user, rooms, students, complaints, outpasses, feePayments = [], feeStructures = [] }) => {

    if (user.role === 'super_admin') {
        const totalFeeCollected = feePayments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);
        const stats = [
            { icon: '🎓', value: students.length, label: 'Total Students' },
            { icon: '📝', value: complaints.filter(c => c.status === 'pending').length, label: 'Pending Complaints' },
            { icon: '🔑', value: outpasses.filter(o => o.status === 'pending').length, label: 'Pending Outpasses' },
            { icon: '💰', value: fmt(totalFeeCollected), label: 'Fees Collected' },
            { icon: '⏳', value: feePayments.filter(p => p.status === 'pending').length, label: 'Pending Fee Proofs' },
        ];
        return (
            <div className="stats">
                {stats.map((s, i) => (
                    <div key={i} className="stat">
                        <div className="icon">{s.icon}</div>
                        <div><div className="value">{s.value}</div><div className="label">{s.label}</div></div>
                    </div>
                ))}
            </div>
        );
    }

    if (user.role === 'hostel_manager') {
        const totalFeeCollected = feePayments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);
        const stats = [
            { icon: '🏠', value: rooms.length, label: 'Total Rooms' },
            { icon: '✅', value: rooms.filter(r => r.status === 'occupied').length, label: 'Occupied' },
            { icon: '🆓', value: rooms.filter(r => r.status === 'available').length, label: 'Available' },
            { icon: '👥', value: students.length, label: 'Students' },
            { icon: '📝', value: complaints.filter(c => c.status === 'pending').length, label: 'Pending Complaints' },
            { icon: '🔑', value: outpasses.filter(o => o.status === 'pending').length, label: 'Pending Outpasses' },
            { icon: '💰', value: fmt(totalFeeCollected), label: 'Fees Collected' },
            { icon: '⏳', value: feePayments.filter(p => p.status === 'pending').length, label: 'Pending Fee Proofs' },
        ];
        return (
            <div className="stats">
                {stats.map((s, i) => (
                    <div key={i} className="stat">
                        <div className="icon">{s.icon}</div>
                        <div><div className="value">{s.value}</div><div className="label">{s.label}</div></div>
                    </div>
                ))}
            </div>
        );
    }

    // ── Student view ──
    const rejectedOutpasses = outpasses.filter(o => o.studentId === user.studentId && o.status === 'rejected' && o.rejectionReason);
    const myFees = feePayments.filter(p => p.studentId === user.studentId);
    const myVerified = myFees.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);
    const myPending = myFees.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const myRejected = myFees.filter(p => p.status === 'rejected');

    const notifications = [
        ...rejectedOutpasses.map(o => ({
            id: `op-${o.id}`, type: 'outpass',
            title: 'Outpass Rejected',
            body: `${o.reason} (${new Date(o.fromDate).toLocaleDateString()} – ${new Date(o.toDate).toLocaleDateString()})`,
            reason: o.rejectionReason,
            date: o.rejectedDate,
        })),
        ...myRejected.map(p => ({
            id: `fee-${p.id}`, type: 'fee',
            title: 'Fee Payment Rejected',
            body: `${p.feeType} – ${fmt(p.amount)} (${p.paymentMode})`,
            reason: p.rejectionReason,
            date: p.verifiedAt,
        })),
    ];

    return (
        <div className="dashboard">
            <div className="info-card">
                <h3>My Room Details</h3>
                {user.room ? (
                    <div className="grid-2">
                        <div className="item"><label>Room Number</label><div>#{user.room}</div></div>
                        <div className="item"><label>Hostel</label><div>{user.hostel}</div></div>
                        <div className="item"><label>Department</label><div>{user.department}</div></div>
                        <div className="item"><label>Year</label><div>{user.year}</div></div>
                    </div>
                ) : (
                    <p className="empty">No room assigned. Contact admin.</p>
                )}
            </div>

            {/* Fee summary card for student */}
            {(myFees.length > 0 || feeStructures.length > 0) && (
                <div className="info-card">
                    <h3>💳 My Fee Status</h3>
                    <div className="grid-2">
                        <div className="item"><label>Verified Paid</label><div style={{ color: 'var(--success)' }}>{fmt(myVerified)}</div></div>
                        <div className="item"><label>Awaiting Verification</label><div style={{ color: 'var(--warning)' }}>{fmt(myPending)}</div></div>
                        <div className="item"><label>Total Submissions</label><div>{myFees.length}</div></div>
                        <div className="item"><label>Rejected Proofs</label><div style={{ color: myRejected.length > 0 ? 'var(--danger)' : 'inherit' }}>{myRejected.length}</div></div>
                    </div>
                    {feeStructures.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Fee Structure</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {feeStructures.map(f => (
                                    <span key={f.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: '#1e3a8a', fontWeight: 600 }}>
                                        {f.label}: <b>₹{Number(f.amount).toLocaleString('en-IN')}</b>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {notifications.length > 0 && (
                <div className="notifications">
                    <h3>🔔 Notifications</h3>
                    {notifications.map(n => (
                        <div key={n.id} className="notif rejected">
                            <div className="n-header">❌ <strong>{n.title}</strong></div>
                            <div><b>Details:</b> {n.body}</div>
                            {n.reason && <div className="reason"><b>Reason:</b> {n.reason}</div>}
                            {n.date && <div className="date">{new Date(n.date).toLocaleDateString()}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
