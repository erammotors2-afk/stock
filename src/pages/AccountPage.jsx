import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';

const AccountPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('account');
    const [darkMode, setDarkMode] = useDarkMode();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [rawUser, setRawUser] = useState(null);

    // Editable display name
    const [displayName, setDisplayName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);

    // Session info
    const [loginTime, setLoginTime] = useState('');
    const [sessionAge, setSessionAge] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setRawUser(parsedUser);
            setUserRole(parsedUser.role || 'user');
            setUserEmail(parsedUser.email || parsedUser.username || '');

            let nameToDisplay = parsedUser.full_name || parsedUser.username || 'User';
            if (nameToDisplay.includes('@') && /\d/.test(nameToDisplay)) {
                nameToDisplay = parsedUser.username || 'User';
            }
            const formatted = nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1);
            setUserName(formatted);

            // Display name can be overridden locally
            const override = localStorage.getItem('displayNameOverride');
            setDisplayName(override || formatted);

            // Session time
            const loginTs = localStorage.getItem('loginTimestamp');
            if (loginTs) {
                const ts = parseInt(loginTs);
                const date = new Date(ts);
                setLoginTime(date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
                const mins = Math.floor((Date.now() - ts) / 60000);
                if (mins < 60) setSessionAge(`${mins} min${mins !== 1 ? 's' : ''}`);
                else { const h = Math.floor(mins / 60); setSessionAge(`${h} hr${h !== 1 ? 's' : ''} ${mins % 60} min`); }
            } else {
                // Record now if not set
                localStorage.setItem('loginTimestamp', Date.now().toString());
                setLoginTime('Just now');
                setSessionAge('< 1 min');
            }
        } else {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleSaveName = () => {
        localStorage.setItem('displayNameOverride', displayName);
        setUserName(displayName);
        setEditingName(false);
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 2000);
    };

    const handleLogoutClick = () => { setShowLogoutModal(true); if (window.innerWidth <= 850) setMobileSidebar(false); };
    const confirmLogout = () => { localStorage.removeItem('user'); navigate('/', { replace: true }); };
    const cancelLogout = () => setShowLogoutModal(false);

    const roleBadgeColor = { admin: '#ef4444', head: '#f59e0b', user: '#10b981' };
    const roleColor = roleBadgeColor[userRole] || '#6366f1';

    const card = {
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: '12px', marginBottom: '16px', overflow: 'hidden',
    };
    const cardHead = {
        background: 'var(--sidebar-bg)', padding: '12px 18px',
        borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px',
    };
    const cardTitle = { fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 };
    const row = (last = false) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: last ? 'none' : '1px solid var(--border)' });
    const lbl = { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' };
    const val = { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' };

    return (
        <div className={`db ${darkMode ? 'dark' : 'light'} ${sidebarOpen && !mobileSidebar ? 'sb-open' : 'sb-closed'}`}>
            {mobileSidebar && <div className="mobile-overlay" onClick={() => setMobileSidebar(false)} />}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileSidebar={mobileSidebar} setMobileSidebar={setMobileSidebar} activeMenu={activeMenu} setActiveMenu={setActiveMenu} userRole={userRole} userName={userName} handleLogoutClick={handleLogoutClick} darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="main">
                <div className="content" style={{ padding: '10px 14px' }}>
                    <div style={{ maxWidth: '680px', padding: '20px 0' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <span style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <div>
                                <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Account Settings</h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>View your profile and manage account details.</p>
                            </div>
                        </div>

                        {/* ─── PROFILE CARD ─── */}
                        <div style={{ ...card, marginBottom: '20px' }}>
                            <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {(displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName || userName}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{userEmail}</div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}44`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {userRole}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── PROFILE INFO ─── */}
                        <div style={card}>
                            <div style={cardHead}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <span style={cardTitle}>Profile Information</span>
                            </div>

                            {/* Display Name */}
                            <div style={row()}>
                                <div><div style={lbl}>Display Name</div><div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>What others see when they view you</div></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {editingName ? (
                                        <>
                                            <input
                                                value={displayName}
                                                onChange={e => setDisplayName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                                autoFocus
                                                style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '12px', width: '140px' }}
                                            />
                                            <button onClick={handleSaveName} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                                            <button onClick={() => setEditingName(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={val}>{displayName || userName}</span>
                                            {nameSaved && <span style={{ color: '#10b981', fontSize: '11px' }}>✅</span>}
                                            <button onClick={() => setEditingName(true)} style={{ background: 'transparent', color: 'var(--brand-primary, #6366f1)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div style={row()}>
                                <div style={lbl}>Username / Email</div>
                                <div style={val}>{userEmail}</div>
                            </div>
                            <div style={row()}>
                                <div style={lbl}>Role</div>
                                <span style={{ background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}44`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{userRole}</span>
                            </div>
                            <div style={row(true)}>
                                <div style={lbl}>Account Status</div>
                                <span style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>🟢 Active</span>
                            </div>
                        </div>

                        {/* ─── SESSION INFO ─── */}
                        <div style={card}>
                            <div style={cardHead}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <span style={cardTitle}>Current Session</span>
                            </div>
                            <div style={row()}>
                                <div style={lbl}>Logged In Since</div>
                                <div style={val}>{loginTime || '—'}</div>
                            </div>
                            <div style={row()}>
                                <div style={lbl}>Session Duration</div>
                                <div style={val}>{sessionAge || '—'}</div>
                            </div>
                            <div style={row()}>
                                <div style={lbl}>Auto-Logout</div>
                                <div style={val}>After 10 min inactivity</div>
                            </div>
                            <div style={row(true)}>
                                <div style={lbl}>Device</div>
                                <div style={val}>{navigator.platform || 'Unknown'}</div>
                            </div>
                        </div>

                        {/* ─── DANGER ZONE ─── */}
                        <div style={{ ...card, borderColor: '#ef444430' }}>
                            <div style={{ ...cardHead, background: '#ef444408' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span style={{ ...cardTitle, color: '#ef4444' }}>Actions</span>
                            </div>
                            <div style={row(true)}>
                                <div>
                                    <div style={{ ...lbl, color: '#ef4444' }}>Sign Out</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>End your current session and return to login</div>
                                </div>
                                <button
                                    onClick={handleLogoutClick}
                                    style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <LogoutModal show={showLogoutModal} onCancel={cancelLogout} onConfirm={confirmLogout} />
        </div>
    );
};

export default AccountPage;
