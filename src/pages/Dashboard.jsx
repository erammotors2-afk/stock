import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useDarkMode();
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserRole(parsedUser.role || 'user');
            let nameToDisplay = parsedUser.full_name || parsedUser.username || 'User';
            if (nameToDisplay.includes('@') && /\d/.test(nameToDisplay)) {
                nameToDisplay = parsedUser.username || 'User';
            }
            nameToDisplay = nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1);
            setUserName(nameToDisplay);
        } else {
            navigate('/', { replace: true });
        }
    }, [navigate]);


    useEffect(() => {
        let timeoutId;
        const INACTIVITY_LIMIT = 600000;
        const handleInactivityLogout = () => {
            localStorage.removeItem('user');
            localStorage.removeItem('loginExpiry');
            navigate('/', { replace: true });
        };
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleInactivityLogout, INACTIVITY_LIMIT);
        };
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loginExpiry');
        navigate('/', { replace: true });
    };

    const cancelLogout = () => setShowLogoutModal(false);

    const icons = {
        dashboard: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
        search: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        menu: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        ),
        stock: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        approved: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <polyline points="9 15 11 17 15 13" />
            </svg>
        ),
        stockStatus: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
        ),
        sapIbnd: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
        pending: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        cancel: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        sapDone: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    };

    const stats = [
        { title: 'Total Stock', value: '547', change: '+12%', up: true, color: 'red', icon: icons.stock },
        { title: 'Approved', value: '312', change: '+8%', up: true, color: 'green', icon: icons.approved },
        { title: 'Unallotted', value: '89', change: '+5%', up: true, color: 'purple', icon: icons.stockStatus },
        { title: 'SAP IBND', value: '156', change: '+18%', up: true, color: 'blue', icon: icons.sapIbnd },
        { title: 'SAP Pending', value: '43', change: '-3%', up: false, color: 'orange', icon: icons.pending },
        { title: 'Cancellation', value: '12', change: '-15%', up: false, color: 'pink', icon: icons.cancel },
        { title: 'DMS Pending', value: '28', change: '+2%', up: true, color: 'teal', icon: icons.sapDone },
    ];

    const recentVehicles = [
        { model: 'Thar ROXX', variant: 'AX7 AT Diesel', color: 'Red Rage', stock: 'In Stock', price: '₹22.49L', img: '🚗' },
        { model: 'XUV700', variant: 'AX7 L AT', color: 'Everest White', stock: 'In Transit', price: '₹24.99L', img: '🚙' },
        { model: 'Scorpio-N', variant: 'Z8 L AT', color: 'Deep Forest', stock: 'In Stock', price: '₹20.99L', img: '🚘' },
        { model: 'XUV 3XO', variant: 'AX7 L Turbo', color: 'Tango Red', stock: 'Sold', price: '₹15.49L', img: '🚗' },
        { model: 'Bolero Neo', variant: 'N10 (O)', color: 'Majestic Silver', stock: 'In Stock', price: '₹11.29L', img: '🚙' },
    ];

    const activities = [
        { text: 'New Thar ROXX added to inventory', time: '2 min ago', type: 'add' },
        { text: 'XUV700 AX7 sold to customer', time: '15 min ago', type: 'sold' },
        { text: 'Scorpio-N stock updated', time: '1 hr ago', type: 'update' },
        { text: 'New order received from Kochi', time: '2 hr ago', type: 'order' },
        { text: 'Monthly report generated', time: '3 hr ago', type: 'report' },
    ];

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
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)}>
                            {icons.menu}
                        </button>
                        <div className="stylish-header">
                            <div className="dash-title-row">
                                <span className="dash-icon">{icons.dashboard}</span>
                                <div className="dash-title-text">
                                    <h2 className="dash-title">Dashboard</h2>
                                    <div className="dash-welcome">
                                        <span>Welcome back,</span>
                                        <strong className="dash-name">{userName}</strong>
                                        <span className="dash-wave">👋</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="topbar-right">
                        <div className="search-box topbar-search">
                            {icons.search}
                            <input type="text" placeholder="Search vehicles, orders..." />
                        </div>

                        <button className="topbar-icon-btn" title="Notifications">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="notif-badge">3</span>
                        </button>

                        <div className="topbar-avatar" onClick={handleLogoutClick} title="Logout">
                            <span>{userName.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                <div className="content">
                    <div className="stats-grid">
                        {stats.map((s, i) => (
                            <div className={`stat-card sc-${s.color}`} key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="stat-icon-box">
                                    <div className={`stat-icon si-${s.color}`}>{s.icon}</div>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-title">{s.title}</div>
                                    <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            {s.up
                                                ? <polyline points="18 15 12 9 6 15" />
                                                : <polyline points="6 9 12 15 18 9" />
                                            }
                                        </svg>
                                        {s.change}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="main-grid">
                        <div className="card table-card">
                            <div className="card-head">
                                <h3>Recent Vehicles</h3>
                                <button className="card-btn">View All</button>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Vehicle</th>
                                            <th>Variant</th>
                                            <th>Color</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentVehicles.map((v, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="v-cell">
                                                        <span className="v-emoji">{v.img}</span>
                                                        <strong>{v.model}</strong>
                                                    </div>
                                                </td>
                                                <td>{v.variant}</td>
                                                <td>{v.color}</td>
                                                <td>
                                                    <span className={`status-tag st-${v.stock.replace(/\s/g, '').toLowerCase()}`}>
                                                        {v.stock}
                                                    </span>
                                                </td>
                                                <td><strong>{v.price}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card activity-card">
                            <div className="card-head">
                                <h3>Recent Activity</h3>
                                <button className="card-btn">See All</button>
                            </div>
                            <div className="activity-list">
                                <div className="activity-line" />
                                {activities.map((a, i) => (
                                    <div className="activity-item" key={i}>
                                        <div className={`act-dot at-${a.type}`} />
                                        <div className="act-body">
                                            <p>{a.text}</p>
                                            <span>{a.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="quick-row">
                        <div className="card mini-card">
                            <h4>Stock by Model</h4>
                            <div className="mini-bars">
                                {[
                                    { name: 'Thar ROXX', val: 85 },
                                    { name: 'XUV700', val: 72 },
                                    { name: 'Scorpio-N', val: 60 },
                                    { name: 'XUV 3XO', val: 45 },
                                    { name: 'Bolero Neo', val: 30 },
                                ].map((b, i) => (
                                    <div className="mini-bar-item" key={i}>
                                        <div className="mini-bar-head">
                                            <span>{b.name}</span>
                                            <span>{b.val}%</span>
                                        </div>
                                        <div className="mini-bar-track">
                                            <div
                                                className="mini-bar-fill"
                                                style={{ width: `${b.val}%`, animationDelay: `${i * 0.1}s` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card mini-card">
                            <h4>Showroom Performance</h4>
                            <div className="perf-list">
                                {[
                                    { name: 'Kochi HQ', val: '₹4.2Cr', pct: 92 },
                                    { name: 'Calicut', val: '₹3.1Cr', pct: 78 },
                                    { name: 'Thrissur', val: '₹2.8Cr', pct: 70 },
                                    { name: 'Trivandrum', val: '₹2.4Cr', pct: 62 },
                                ].map((p, i) => (
                                    <div className="perf-item" key={i}>
                                        <div className="perf-info">
                                            <strong>{p.name}</strong>
                                            <span>{p.val}</span>
                                        </div>
                                        <div className="perf-ring">
                                            <svg viewBox="0 0 36 36">
                                                <path
                                                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                                                    fill="none" strokeWidth="3" className="ring-bg"
                                                />
                                                <path
                                                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                                                    fill="none" strokeWidth="3" className="ring-fill"
                                                    strokeDasharray={`${p.pct}, 100`}
                                                />
                                            </svg>
                                            <span>{p.pct}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══ SEPARATE LOGOUT MODULE ═══ */}
            <LogoutModal
                show={showLogoutModal}
                onCancel={cancelLogout}
                onConfirm={confirmLogout}
            />
        </div>
    );
};

export default Dashboard;