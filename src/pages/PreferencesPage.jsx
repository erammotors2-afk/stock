import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';

export const DEFAULT_PREFS = {
    rowsPerPage: '100',
    defaultPage: '/dashboard',
    tableDensity: 'normal',
    autoRefresh: false,
    showSLNo: true,
    dateFormat: 'dd-mm-yyyy',
    sidebarDefaultOpen: false,
};

export const getPrefs = () => {
    try {
        const saved = localStorage.getItem('userPreferences');
        return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : { ...DEFAULT_PREFS };
    } catch {
        return { ...DEFAULT_PREFS };
    }
};

const PreferencesPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('preferences');
    const [darkMode, setDarkMode] = useDarkMode();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserRole(parsedUser.role || 'user');
            let nameToDisplay = parsedUser.full_name || parsedUser.username || 'User';
            if (nameToDisplay.includes('@') && /\d/.test(nameToDisplay)) {
                nameToDisplay = parsedUser.username || 'User';
            }
            setUserName(nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1));
        } else {
            navigate('/', { replace: true });
        }
        setPrefs(getPrefs());
    }, [navigate]);

    const handleChange = (key, value) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
    };

    const applyAndSave = (updatedPrefs) => {
        localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
        // Apply table density via CSS variable on root
        document.documentElement.setAttribute('data-density', updatedPrefs.tableDensity);
    };

    const handleSave = () => {
        // Apply theme immediately
        setDarkMode(darkMode); // already applied via hook
        // Apply table density
        applyAndSave(prefs);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2500);
    };

    const handleReset = () => {
        setPrefs(DEFAULT_PREFS);
        applyAndSave(DEFAULT_PREFS);
        setSaveStatus('reset');
        setTimeout(() => setSaveStatus(''), 2500);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };
    const confirmLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('loginExpiry'); navigate('/', { replace: true }); };
    const cancelLogout = () => setShowLogoutModal(false);

    const Toggle = ({ val, onChange }) => (
        <div
            onClick={() => onChange(!val)}
            style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: val ? '#10b981' : 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                flexShrink: 0,
            }}
        >
            <div style={{
                position: 'absolute', top: '3px',
                left: val ? '22px' : '3px',
                width: '18px', height: '18px',
                borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
        </div>
    );

    const section = {
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden',
    };
    const sectionHead = {
        background: 'var(--sidebar-bg)',
        padding: '12px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '8px',
    };
    const sectionTitle = { fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 };
    const row = (last = false) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: last ? 'none' : '1px solid var(--border)',
    });
    const lbl = { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' };
    const hint = { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' };
    const sel = {
        background: 'var(--sidebar-bg)', border: '1px solid var(--border)',
        borderRadius: '7px', color: 'var(--text-primary)',
        padding: '6px 10px', fontSize: '12px', cursor: 'pointer', minWidth: '140px',
    };

    return (
        <div className={`db ${darkMode ? 'dark' : 'light'} ${sidebarOpen && !mobileSidebar ? 'sb-open' : 'sb-closed'}`}>
            {mobileSidebar && <div className="mobile-overlay" onClick={() => setMobileSidebar(false)} />}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileSidebar={mobileSidebar} setMobileSidebar={setMobileSidebar} activeMenu={activeMenu} setActiveMenu={setActiveMenu} userRole={userRole} userName={userName} handleLogoutClick={handleLogoutClick} darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="main">
                <div className="content" style={{ padding: '10px 14px' }}>
                    <div style={{ maxWidth: '720px', padding: '20px 0' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <span style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            </span>
                            <div>
                                <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Preferences</h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Settings saved here apply across all pages immediately.</p>
                            </div>
                        </div>

                        {/* ── DISPLAY ── */}
                        <div style={section}>
                            <div style={sectionHead}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                <span style={sectionTitle}>Display</span>
                            </div>
                            <div style={row()}>
                                <div><div style={lbl}>Theme</div><div style={hint}>Switch dark / light mode</div></div>
                                <select style={sel} value={darkMode ? 'dark' : 'light'} onChange={e => setDarkMode(e.target.value === 'dark')}>
                                    <option value="light">☀️ Light Mode</option>
                                    <option value="dark">🌙 Dark Mode</option>
                                </select>
                            </div>
                            <div style={row()}>
                                <div><div style={lbl}>Table Density</div><div style={hint}>Compact or spacious rows</div></div>
                                <select style={sel} value={prefs.tableDensity} onChange={e => handleChange('tableDensity', e.target.value)}>
                                    <option value="compact">Compact</option>
                                    <option value="normal">Normal</option>
                                    <option value="comfortable">Comfortable</option>
                                </select>
                            </div>
                            <div style={row(true)}>
                                <div><div style={lbl}>Show SL No Column</div><div style={hint}>Serial number column in all tables</div></div>
                                <Toggle val={prefs.showSLNo} onChange={v => handleChange('showSLNo', v)} />
                            </div>
                        </div>

                        {/* ── DATA ── */}
                        <div style={section}>
                            <div style={sectionHead}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                <span style={sectionTitle}>Data & Tables</span>
                            </div>
                            <div style={row()}>
                                <div><div style={lbl}>Rows Per Page</div><div style={hint}>Default rows loaded per table page</div></div>
                                <select style={sel} value={prefs.rowsPerPage} onChange={e => handleChange('rowsPerPage', e.target.value)}>
                                    <option value="50">50 rows</option>
                                    <option value="100">100 rows</option>
                                    <option value="200">200 rows</option>
                                    <option value="500">500 rows</option>
                                </select>
                            </div>
                            <div style={row()}>
                                <div><div style={lbl}>Date Format</div><div style={hint}>How dates display in all tables</div></div>
                                <select style={sel} value={prefs.dateFormat} onChange={e => handleChange('dateFormat', e.target.value)}>
                                    <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                                    <option value="mm-dd-yyyy">MM-DD-YYYY</option>
                                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div style={row(true)}>
                                <div><div style={lbl}>Auto-Refresh Tables</div><div style={hint}>Reload data every 5 minutes</div></div>
                                <Toggle val={prefs.autoRefresh} onChange={v => handleChange('autoRefresh', v)} />
                            </div>
                        </div>

                        {/* ── NAVIGATION ── */}
                        <div style={section}>
                            <div style={sectionHead}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                                <span style={sectionTitle}>Navigation</span>
                            </div>
                            <div style={row()}>
                                <div><div style={lbl}>Default Landing Page</div><div style={hint}>Page to open after login</div></div>
                                <select style={sel} value={prefs.defaultPage} onChange={e => handleChange('defaultPage', e.target.value)}>
                                    <option value="/dashboard">Dashboard</option>
                                    <option value="/stock-status">Stock Status</option>
                                    <option value="/delivery">Delivery</option>
                                    <option value="/retail-report">SAP Retail Report</option>
                                </select>
                            </div>
                            <div style={row(true)}>
                                <div><div style={lbl}>Sidebar Open on Start</div><div style={hint}>Keep sidebar expanded by default</div></div>
                                <Toggle val={prefs.sidebarDefaultOpen} onChange={v => handleChange('sidebarDefaultOpen', v)} />
                            </div>
                        </div>

                        {/* ── SAVE ── */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                Save & Apply
                            </button>
                            <button onClick={handleReset} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Reset to Default
                            </button>
                            {saveStatus && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: saveStatus === 'saved' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: saveStatus === 'saved' ? '#10b981' : '#ef4444', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
                                    {saveStatus === 'saved' ? '✅ Saved & applied!' : '↩ Reset to defaults'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <LogoutModal show={showLogoutModal} onCancel={cancelLogout} onConfirm={confirmLogout} />
        </div>
    );
};

export default PreferencesPage;
