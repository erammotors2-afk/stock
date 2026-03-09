import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';

const DEFAULT_PREFS = {
    rowsPerPage: '100',
    defaultPage: '/dashboard',
    tableDensity: 'normal',
    autoRefresh: false,
    autoRefreshInterval: '60',
    showSLNo: true,
    dateFormat: 'dd-mm-yyyy',
    sidebarDefaultOpen: false,
    language: 'English',
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

        // Load saved preferences
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(savedPrefs) });
        }
    }, [navigate]);

    const handleChange = (key, value) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('userPreferences', JSON.stringify(prefs));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2500);
    };

    const handleReset = () => {
        setPrefs(DEFAULT_PREFS);
        localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFS));
        setSaveStatus('reset');
        setTimeout(() => setSaveStatus(''), 2500);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };
    const confirmLogout = () => { localStorage.removeItem('user'); navigate('/', { replace: true }); };
    const cancelLogout = () => setShowLogoutModal(false);

    const styles = {
        page: { padding: '20px 24px', maxWidth: '760px' },
        header: { marginBottom: '24px' },
        title: { fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
        subtitle: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' },
        section: {
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            marginBottom: '16px',
            overflow: 'hidden',
        },
        sectionHeader: {
            background: 'var(--sidebar-bg)',
            padding: '12px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        sectionTitle: { fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 },
        row: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
        },
        lastRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
        },
        label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' },
        hint: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
        select: {
            background: 'var(--input-bg, var(--sidebar-bg))',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            minWidth: '130px',
        },
        toggle: {
            position: 'relative',
            width: '44px',
            height: '24px',
            cursor: 'pointer',
        },
        actions: { display: 'flex', gap: '10px', marginTop: '20px' },
        saveBtn: {
            background: 'linear-gradient(135deg, #10b981, #047857)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 22px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        resetBtn: {
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 22px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
        },
        savedBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: saveStatus === 'saved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: saveStatus === 'saved' ? '#10b981' : '#ef4444',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
        }
    };

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

    return (
        <div className={`db ${darkMode ? 'dark' : 'light'} ${sidebarOpen && !mobileSidebar ? 'sb-open' : 'sb-closed'}`}>

            {mobileSidebar && <div className="mobile-overlay" onClick={() => setMobileSidebar(false)} />}

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                mobileSidebar={mobileSidebar}
                setMobileSidebar={setMobileSidebar}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                userRole={userRole}
                userName={userName}
                handleLogoutClick={handleLogoutClick}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />

            <main className="main">
                <div className="content" style={{ padding: '10px 14px' }}>
                    <div style={styles.page}>
                        {/* Header */}
                        <div style={styles.header}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <span style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '30px', height: '30px', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                </span>
                                <div>
                                    <h2 style={styles.title}>Preferences</h2>
                                    <p style={styles.subtitle}>Customise your experience. Settings are saved to this device.</p>
                                </div>
                            </div>
                        </div>

                        {/* ─── DISPLAY ─── */}
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                <span style={styles.sectionTitle}>Display</span>
                            </div>
                            <div style={styles.row}>
                                <div>
                                    <div style={styles.label}>Theme</div>
                                    <div style={styles.hint}>Light or dark interface</div>
                                </div>
                                <select style={styles.select} value={darkMode ? 'dark' : 'light'} onChange={e => setDarkMode(e.target.value === 'dark')}>
                                    <option value="light">☀️ Light Mode</option>
                                    <option value="dark">🌙 Dark Mode</option>
                                </select>
                            </div>
                            <div style={styles.row}>
                                <div>
                                    <div style={styles.label}>Table Density</div>
                                    <div style={styles.hint}>Row height in all tables</div>
                                </div>
                                <select style={styles.select} value={prefs.tableDensity} onChange={e => handleChange('tableDensity', e.target.value)}>
                                    <option value="compact">Compact</option>
                                    <option value="normal">Normal</option>
                                    <option value="comfortable">Comfortable</option>
                                </select>
                            </div>
                            <div style={styles.lastRow}>
                                <div>
                                    <div style={styles.label}>Show SL No Column</div>
                                    <div style={styles.hint}>Serial number in all tables</div>
                                </div>
                                <Toggle val={prefs.showSLNo} onChange={v => handleChange('showSLNo', v)} />
                            </div>
                        </div>

                        {/* ─── DATA ─── */}
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                <span style={styles.sectionTitle}>Data & Tables</span>
                            </div>
                            <div style={styles.row}>
                                <div>
                                    <div style={styles.label}>Rows Per Page</div>
                                    <div style={styles.hint}>Default rows shown in all tables</div>
                                </div>
                                <select style={styles.select} value={prefs.rowsPerPage} onChange={e => handleChange('rowsPerPage', e.target.value)}>
                                    <option value="50">50 rows</option>
                                    <option value="100">100 rows</option>
                                    <option value="200">200 rows</option>
                                    <option value="500">500 rows</option>
                                </select>
                            </div>
                            <div style={styles.row}>
                                <div>
                                    <div style={styles.label}>Date Format</div>
                                    <div style={styles.hint}>How dates are displayed in tables</div>
                                </div>
                                <select style={styles.select} value={prefs.dateFormat} onChange={e => handleChange('dateFormat', e.target.value)}>
                                    <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                                    <option value="mm-dd-yyyy">MM-DD-YYYY</option>
                                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div style={styles.lastRow}>
                                <div>
                                    <div style={styles.label}>Auto-Refresh Tables</div>
                                    <div style={styles.hint}>Automatically reload data</div>
                                </div>
                                <Toggle val={prefs.autoRefresh} onChange={v => handleChange('autoRefresh', v)} />
                            </div>
                        </div>

                        {/* ─── NAVIGATION ─── */}
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                                <span style={styles.sectionTitle}>Navigation</span>
                            </div>
                            <div style={styles.row}>
                                <div>
                                    <div style={styles.label}>Default Landing Page</div>
                                    <div style={styles.hint}>Where to go after login</div>
                                </div>
                                <select style={styles.select} value={prefs.defaultPage} onChange={e => handleChange('defaultPage', e.target.value)}>
                                    <option value="/dashboard">Dashboard</option>
                                    <option value="/stock-status">Stock Status</option>
                                    <option value="/delivery">Delivery</option>
                                    <option value="/retail-report">Retail Report</option>
                                </select>
                            </div>
                            <div style={styles.lastRow}>
                                <div>
                                    <div style={styles.label}>Sidebar Expanded on Start</div>
                                    <div style={styles.hint}>Keep sidebar open by default</div>
                                </div>
                                <Toggle val={prefs.sidebarDefaultOpen} onChange={v => handleChange('sidebarDefaultOpen', v)} />
                            </div>
                        </div>

                        {/* ─── SAVE ACTIONS ─── */}
                        <div style={styles.actions}>
                            <button style={styles.saveBtn} onClick={handleSave}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                Save Preferences
                            </button>
                            <button style={styles.resetBtn} onClick={handleReset}>
                                Reset to Default
                            </button>
                            {saveStatus && (
                                <div style={styles.savedBadge}>
                                    {saveStatus === 'saved' ? '✅ Saved!' : '↩ Reset to defaults'}
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
