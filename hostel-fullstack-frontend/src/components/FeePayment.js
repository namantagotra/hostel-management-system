import React, { useState, useRef } from 'react';
import { api } from '../services/api';

const FEE_TYPES = ['Hostel Fee', 'Mess Fee', 'Maintenance Charge', 'Security Deposit', 'Other'];
const PAYMENT_MODES = ['UPI', 'Net Banking', 'Cash', 'Demand Draft', 'NEFT/RTGS'];

const statusColors = {
    pending:  { bg: '#fff3e0', color: '#e65100', icon: '⏳' },
    verified: { bg: '#e0f2f1', color: '#00695c', icon: '✅' },
    rejected: { bg: '#ffebee', color: '#b71c1c', icon: '❌' },
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Student: Submit Payment ──────────────────────────────────────────────────
const SubmitForm = ({ user, feePayments, feeStructures, reload }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        feeType: FEE_TYPES[0],
        amount: '',
        paymentMode: PAYMENT_MODES[0],
        transactionId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [proofFile, setProofFile] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [proofType, setProofType] = useState(null); // 'image' | 'pdf'
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef();

    const myPayments = feePayments.filter(p => p.studentId === user.studentId);
    const totalPaid = myPayments.filter(p => p.status === 'verified').reduce((s, p) => s + Number(p.amount), 0);
    const totalPending = myPayments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        if (!isImage && !isPDF) return alert('Only image or PDF files are allowed.');
        if (file.size > 5 * 1024 * 1024) return alert('File must be under 5MB.');
        setProofFile(file);
        setProofType(isImage ? 'image' : 'pdf');
        if (isImage) {
            const reader = new FileReader();
            reader.onload = (ev) => setProofPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setProofPreview(null);
        }
    };

    const handleSubmit = async () => {
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return alert('Enter a valid amount.');
        if (!form.transactionId.trim() && form.paymentMode !== 'Cash') return alert('Enter a transaction / reference ID.');
        if (!proofFile) return alert('Please upload a payment proof (screenshot or PDF).');
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('proof', proofFile);
            formData.append('feeType', form.feeType);
            formData.append('amount', form.amount);
            formData.append('paymentMode', form.paymentMode);
            formData.append('transactionId', form.transactionId.trim());
            formData.append('paymentDate', form.paymentDate);
            formData.append('notes', form.notes.trim());
            await api.fees.submitPayment(formData);
            setForm({ feeType: FEE_TYPES[0], amount: '', paymentMode: PAYMENT_MODES[0], transactionId: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
            setProofFile(null); setProofPreview(null); setProofType(null);
            setShowForm(false);
            await reload();
        } catch (err) { alert(err.message); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="page-content">
            {/* Summary cards */}
            <div className="fee-summary-row">
                <div className="fee-summary-card verified">
                    <div className="fee-sum-icon">✅</div>
                    <div>
                        <div className="fee-sum-value">{fmt(totalPaid)}</div>
                        <div className="fee-sum-label">Total Verified</div>
                    </div>
                </div>
                <div className="fee-summary-card pending">
                    <div className="fee-sum-icon">⏳</div>
                    <div>
                        <div className="fee-sum-value">{fmt(totalPending)}</div>
                        <div className="fee-sum-label">Awaiting Verification</div>
                    </div>
                </div>
                <div className="fee-summary-card total">
                    <div className="fee-sum-icon">🧾</div>
                    <div>
                        <div className="fee-sum-value">{myPayments.length}</div>
                        <div className="fee-sum-label">Total Submissions</div>
                    </div>
                </div>
            </div>

            {/* Fee structure notice */}
            {feeStructures.length > 0 && (
                <div className="fee-structure-banner">
                    <strong>📋 Fee Structure</strong>
                    <div className="fee-structure-items">
                        {feeStructures.map(f => (
                            <span key={f.id} className="fee-struct-tag">{f.label}: <b>{fmt(f.amount)}</b></span>
                        ))}
                    </div>
                </div>
            )}

            <div className="action-bar">
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Submit Payment'}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>💳 Submit Fee Payment</h3>
                    <div className="form-row-2col">
                        <div className="form-row">
                            <label>Fee Type</label>
                            <select value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })}>
                                {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Amount (₹)</label>
                            <input type="number" min="1" placeholder="e.g. 15000" value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row">
                            <label>Payment Mode</label>
                            <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })}>
                                {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Transaction / Ref ID {form.paymentMode === 'Cash' ? '(optional)' : ''}</label>
                            <input type="text" placeholder="e.g. UPI123456789" value={form.transactionId}
                                onChange={e => setForm({ ...form, transactionId: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-row">
                            <label>Payment Date</label>
                            <input type="date" value={form.paymentDate}
                                onChange={e => setForm({ ...form, paymentDate: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <label>Notes (optional)</label>
                            <input type="text" placeholder="Any additional info..." value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>
                    </div>

                    {/* Proof upload */}
                    <div className="form-row">
                        <label>Payment Proof <span style={{ color: 'var(--danger)', fontWeight: 800 }}>*</span></label>
                        <div className="proof-upload-area" onClick={() => fileRef.current.click()}>
                            {proofPreview ? (
                                <img src={proofPreview} alt="proof" className="proof-preview-img" />
                            ) : proofFile ? (
                                <div className="proof-pdf-preview">
                                    <span className="proof-pdf-icon">📄</span>
                                    <span>{proofFile.name}</span>
                                </div>
                            ) : (
                                <div className="proof-placeholder">
                                    <span className="proof-upload-icon">📎</span>
                                    <span className="proof-upload-text">Click to upload screenshot or PDF</span>
                                    <span className="proof-upload-hint">JPG, PNG, PDF · Max 5MB</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFile} />
                        {proofFile && (
                            <button className="proof-remove-btn" onClick={() => { setProofFile(null); setProofPreview(null); setProofType(null); fileRef.current.value = ''; }}>
                                ✕ Remove file
                            </button>
                        )}
                    </div>

                    <div className="proof-tips">
                        <strong>💡 What to upload:</strong> UPI screenshot · Bank transfer receipt · Demand draft scan · Cash receipt photo
                    </div>

                    <div className="form-actions">
                        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Submitting...' : '📤 Submit for Verification'}
                        </button>
                        <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* My payment history */}
            <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>📜 My Payment History</h3>
                    <span style={{ fontSize: 13, color: '#718096' }}>{myPayments.length} record{myPayments.length !== 1 ? 's' : ''}</span>
                </div>
                {myPayments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💳</div>
                        <p>No payments submitted yet.</p>
                        <button className="btn-primary" onClick={() => setShowForm(true)}>Submit First Payment</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {myPayments.map(p => (
                            <PaymentCard key={p._id||p.id} payment={p} role="student" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Admin: Verify Payments ───────────────────────────────────────────────────
const AdminVerify = ({ feePayments, feeStructures, setFeeStructures, students, reload }) => {
    const [filter, setFilter] = useState('pending');
    const [viewingProof, setViewingProof] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showStructureForm, setShowStructureForm] = useState(false);
    const [structForm, setStructForm] = useState({ label: '', amount: '' });
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'submissions'

    const counts = { all: feePayments.length, pending: 0, verified: 0, rejected: 0 };
    feePayments.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });

    const visible = filter === 'all' ? feePayments : feePayments.filter(p => p.status === filter);
    const totalVerified = feePayments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);

    // Build per-student fee summary
    const studentFeeMap = {};
    students.forEach(s => {
        const myPayments = feePayments.filter(p => p.studentId === s.studentId);
        const verified = myPayments.filter(p => p.status === 'verified');
        const pending  = myPayments.filter(p => p.status === 'pending');
        const rejected = myPayments.filter(p => p.status === 'rejected');
        const totalPaid = verified.reduce((acc, p) => acc + p.amount, 0);
        const totalPending = pending.reduce((acc, p) => acc + p.amount, 0);

        let overallStatus = 'not_submitted';
        if (myPayments.length > 0) {
            if (verified.length > 0 && pending.length === 0 && rejected.length === 0) overallStatus = 'paid';
            else if (pending.length > 0) overallStatus = 'pending';
            else if (rejected.length > 0 && verified.length === 0 && pending.length === 0) overallStatus = 'rejected';
            else overallStatus = 'partial';
        }

        studentFeeMap[s.studentId] = { student: s, verified, pending, rejected, totalPaid, totalPending, overallStatus, total: myPayments.length };
    });

    const studentStatusColors = {
        paid:          { bg: '#e0f2f1', color: '#00695c', icon: '✅', label: 'Paid' },
        pending:       { bg: '#fff3e0', color: '#e65100', icon: '⏳', label: 'Pending' },
        partial:       { bg: '#e8eaf6', color: '#3949ab', icon: '🔄', label: 'Partial' },
        rejected:      { bg: '#ffebee', color: '#b71c1c', icon: '❌', label: 'Rejected' },
        not_submitted: { bg: '#f3f4f6', color: '#6b7280', icon: '—',  label: 'No Submission' },
    };

    const verify = async (id) => {
        try { await api.fees.verifyPayment(id); await reload(); }
        catch (err) { alert(err.message); }
    };

    const reject = async (id) => {
        if (!rejectReason.trim()) return alert('Please provide a rejection reason.');
        try { await api.fees.rejectPayment(id, rejectReason.trim()); setRejectingId(null); setRejectReason(''); await reload(); }
        catch (err) { alert(err.message); }
    };

    // Helper: get the usable proof URL from a payment object (handles both field names)
    const getProofUrl  = (p) => p.proofDataUrl || p.proofUrl || p.proofFileUrl || null;
    const getProofType = (p) => p.proofType || (getProofUrl(p) && getProofUrl(p).startsWith('data:image') ? 'image' : 'pdf');

    const addStructure = async () => {
        if (!structForm.label.trim() || !structForm.amount || isNaN(structForm.amount)) return alert('Fill both fields.');
        try { await api.fees.addStructure({ label: structForm.label.trim(), amount: Number(structForm.amount) }); setStructForm({ label: '', amount: '' }); setShowStructureForm(false); await reload(); }
        catch (err) { alert(err.message); }
    };

    return (
        <div className="page-content">
            {/* Stats */}
            <div className="fee-summary-row">
                <div className="fee-summary-card verified">
                    <div className="fee-sum-icon">💰</div>
                    <div>
                        <div className="fee-sum-value">{fmt(totalVerified)}</div>
                        <div className="fee-sum-label">Total Verified</div>
                    </div>
                </div>
                <div className="fee-summary-card pending">
                    <div className="fee-sum-icon">⏳</div>
                    <div>
                        <div className="fee-sum-value">{counts.pending}</div>
                        <div className="fee-sum-label">Awaiting Review</div>
                    </div>
                </div>
                <div className="fee-summary-card total">
                    <div className="fee-sum-icon">📊</div>
                    <div>
                        <div className="fee-sum-value">{counts.all}</div>
                        <div className="fee-sum-label">Total Submissions</div>
                    </div>
                </div>
            </div>

            {/* Fee structure manager */}
            <div className="form-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ margin: 0 }}>📋 Fee Structure</h3>
                    <button className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => setShowStructureForm(!showStructureForm)}>
                        {showStructureForm ? '✕ Cancel' : '+ Add Fee Type'}
                    </button>
                </div>
                {showStructureForm && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        <input className="fee-struct-input" placeholder="Label (e.g. Hostel Fee)" value={structForm.label}
                            onChange={e => setStructForm({ ...structForm, label: e.target.value })} />
                        <input className="fee-struct-input" type="number" placeholder="Amount (₹)" value={structForm.amount}
                            onChange={e => setStructForm({ ...structForm, amount: e.target.value })} />
                        <button className="btn-success" onClick={addStructure}>Add</button>
                    </div>
                )}
                {feeStructures.length === 0 ? (
                    <p style={{ color: '#a0aec0', fontSize: 13 }}>No fee types defined yet.</p>
                ) : (
                    <div className="fee-structure-items">
                        {feeStructures.map(f => (
                            <div key={f.id} className="fee-struct-tag" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{f.label}: <b>{fmt(f.amount)}</b></span>
                                <button className="proof-remove-btn" style={{ margin: 0, padding: '2px 8px', fontSize: 11 }}
                                    onClick={async () => { try { await api.fees.deleteStructure(f._id||f.id); await reload(); } catch(err){ alert(err.message); } }}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab switcher */}
            <div className="mess-tabs" style={{ marginBottom: 0 }}>
                <button className={`mess-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    👥 Student Overview
                </button>
                <button className={`mess-tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
                    📄 All Submissions {counts.pending > 0 && <span style={{ marginLeft: 6, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{counts.pending}</span>}
                </button>
            </div>

            {/* ── Student Overview Tab ── */}
            {activeTab === 'overview' && (
                <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, flex: 1 }}>Student Fee Status</h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {Object.entries(studentStatusColors).map(([k, v]) => (
                                <span key={k} style={{ background: v.bg, color: v.color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                                    {v.icon} {v.label}: {Object.values(studentFeeMap).filter(x => x.overallStatus === k).length}
                                </span>
                            ))}
                        </div>
                    </div>
                    {students.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">👥</div><p>No students registered.</p></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f7f8ff' }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e8eaf6' }}>Student</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e8eaf6' }}>Room</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e8eaf6' }}>Fee Status</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e8eaf6' }}>Verified Paid</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e8eaf6' }}>Pending</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #e8eaf6' }}>Submissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => {
                                    const info = studentFeeMap[s.studentId];
                                    const sc = studentStatusColors[info.overallStatus];
                                    return (
                                        <tr key={s.id} style={{ borderBottom: '1px solid #f0f2f8' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f7f8ff'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, color: '#1a202c', fontSize: 14 }}>{s.name}</div>
                                                <div style={{ fontSize: 12, color: '#718096' }}>{s.studentId} · {s.department}</div>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: 14, color: '#4a5568' }}>
                                                {s.room ? `#${s.room}` : <span style={{ color: '#a0aec0' }}>Not assigned</span>}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                    {sc.icon} {sc.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#00897b', fontSize: 14 }}>
                                                {info.totalPaid > 0 ? fmt(info.totalPaid) : <span style={{ color: '#a0aec0' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: 700, color: info.totalPending > 0 ? '#e65100' : '#a0aec0', fontSize: 14 }}>
                                                {info.totalPending > 0 ? fmt(info.totalPending) : '—'}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {info.total > 0 ? (
                                                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                        {info.verified.length > 0 && <span style={{ background: '#e0f2f1', color: '#00695c', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>✅ {info.verified.length} verified</span>}
                                                        {info.pending.length > 0 && <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>⏳ {info.pending.length} pending</span>}
                                                        {info.rejected.length > 0 && <span style={{ background: '#ffebee', color: '#b71c1c', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>❌ {info.rejected.length} rejected</span>}
                                                    </div>
                                                ) : <span style={{ color: '#a0aec0', fontSize: 13 }}>No submissions</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Submissions Tab ── */}
            {activeTab === 'submissions' && (
                <>
                    <div className="filter-bar">
                        {['all', 'pending', 'verified', 'rejected'].map(s => (
                            <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)} <span className="filter-count">{counts[s]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {visible.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p>No {filter !== 'all' ? filter : ''} payments found.</p>
                            </div>
                        ) : visible.map(p => (
                            <div key={p._id||p.id}>
                                <PaymentCard
                                    payment={p}
                                    role="admin"
                                    onVerify={() => verify(p._id || p.id)}
                                    onReject={() => { setRejectingId(p._id || p.id); setRejectReason(''); }}
                                    onViewProof={() => setViewingProof({ ...p, proofDataUrl: getProofUrl(p), proofType: getProofType(p) })}
                                    getProofUrl={getProofUrl}
                                />
                                {rejectingId === (p._id || p.id) && (
                                    <div className="reject-form" style={{ margin: '0 18px 16px' }}>
                                        <textarea placeholder="Reason for rejection (required)..." value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)} rows={2} />
                                        <div className="form-actions">
                                            <button className="btn-danger" onClick={() => reject(p._id || p.id)}>Confirm Reject</button>
                                            <button className="btn-ghost" onClick={() => setRejectingId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Proof lightbox */}
            {viewingProof && (
                <div className="proof-lightbox" onClick={() => setViewingProof(null)}>
                    <div className="proof-lightbox-inner" onClick={e => e.stopPropagation()}>
                        <div className="proof-lightbox-header">
                            <div>
                                <strong>{viewingProof.studentName}</strong> · {viewingProof.feeType} · {fmt(viewingProof.amount)}
                                <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{viewingProof.proofName}</div>
                            </div>
                            <button className="proof-lightbox-close" onClick={() => setViewingProof(null)}>✕</button>
                        </div>
                        <div className="proof-lightbox-body">
                            {viewingProof.proofType === 'image' ? (
                                <img src={viewingProof.proofDataUrl} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, display: 'block', margin: '0 auto' }} />
                            ) : (
                                <div className="proof-pdf-view">
                                    <span style={{ fontSize: 56 }}>📄</span>
                                    <p>{viewingProof.proofName}</p>
                                    <a href={viewingProof.proofDataUrl} download={viewingProof.proofName} className="btn-primary" style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14 }}>
                                        ⬇ Download PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Shared Payment Card ──────────────────────────────────────────────────────
// Resolve proof URL from whichever field the backend returns
const resolveProof = (p) => ({
    url:  p.proofDataUrl || p.proofUrl || p.proofFileUrl || null,
    type: p.proofType   || (
              (p.proofDataUrl || p.proofUrl || p.proofFileUrl || '').startsWith('data:image') ||
              /\.(jpg|jpeg|png|gif|webp)$/i.test(p.proofName || '')
                  ? 'image' : 'pdf'
          ),
});

const PaymentCard = ({ payment: p, role, onVerify, onReject, onViewProof }) => {
    const s = statusColors[p.status] || statusColors.pending;
    const proof = resolveProof(p);
    // For student view, build a local viewProof handler so they can see their own uploaded proof
    const [localProof, setLocalProof] = React.useState(null);
    const handleStudentViewProof = () => {
        setLocalProof({ ...p, proofDataUrl: proof.url, proofType: proof.type });
    };
    return (
        <div className="fee-payment-card">
            {/* Student local lightbox */}
            {localProof && (
                <div className="proof-lightbox" onClick={() => setLocalProof(null)}>
                    <div className="proof-lightbox-inner" onClick={e => e.stopPropagation()}>
                        <div className="proof-lightbox-header">
                            <div>
                                <strong>{localProof.feeType}</strong> · {fmt(localProof.amount)}
                                <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{localProof.proofName}</div>
                            </div>
                            <button className="proof-lightbox-close" onClick={() => setLocalProof(null)}>✕</button>
                        </div>
                        <div className="proof-lightbox-body">
                            {localProof.proofType === 'image' ? (
                                <img src={localProof.proofDataUrl} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, display: 'block', margin: '0 auto' }} />
                            ) : (
                                <div className="proof-pdf-view">
                                    <span style={{ fontSize: 56 }}>📄</span>
                                    <p>{localProof.proofName}</p>
                                    <a href={localProof.proofDataUrl} download={localProof.proofName} className="btn-primary" style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14 }}>
                                        ⬇ Download PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="fee-card-top">
                <div className="fee-card-left">
                    <span className="fee-type-tag">{p.feeType}</span>
                    {role === 'admin' && <span className="fee-student-name">👤 {p.studentName} · Room {p.room}</span>}
                    <span className="fee-amount">{fmt(p.amount)}</span>
                    <div className="fee-meta">
                        <span>📅 {fmtDate(p.paymentDate)}</span>
                        <span>🏦 {p.paymentMode}</span>
                        {p.transactionId && <span>🆔 {p.transactionId}</span>}
                    </div>
                    {p.notes && <div className="fee-notes">📝 {p.notes}</div>}
                </div>
                <div className="fee-card-right">
                    <span className="fee-status-badge" style={{ background: s.bg, color: s.color }}>
                        {s.icon} {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                    {/* Show proof button whenever a proof URL exists — works for both student and admin */}
                    {(proof.url || p.proofName) && (
                        <button className="fee-proof-btn" onClick={role === 'admin' ? onViewProof : handleStudentViewProof}>
                            {proof.type === 'image' ? '🖼 View Proof' : '📄 View PDF'}
                        </button>
                    )}
                    {role === 'admin' && p.status === 'pending' && (
                        <div className="admin-actions" style={{ marginTop: 8 }}>
                            <button className="btn-success" onClick={onVerify}>✅ Verify</button>
                            <button className="btn-danger" onClick={onReject}>❌ Reject</button>
                        </div>
                    )}
                </div>
            </div>
            {p.rejectionReason && (
                <div className="rejection-note">
                    <strong>Rejection Reason:</strong> {p.rejectionReason}
                </div>
            )}
            {p.verifiedAt && p.status === 'verified' && (
                <div style={{ fontSize: 12, color: '#00897b', marginTop: 8 }}>
                    ✅ Verified on {fmtDate(p.verifiedAt)}
                </div>
            )}
        </div>
    );
};

// ── Main Export ──────────────────────────────────────────────────────────────
const FeePayment = ({ feePayments, feeStructures, setFeeStructures, students = [], user, reload }) => {
    const isAdmin = user.role === 'hostel_manager' || user.role === 'super_admin';
    return isAdmin
        ? <AdminVerify feePayments={feePayments} feeStructures={feeStructures} setFeeStructures={setFeeStructures} students={students} reload={reload} />
        : <SubmitForm user={user} feePayments={feePayments} feeStructures={feeStructures} reload={reload} />;
};

export default FeePayment;
