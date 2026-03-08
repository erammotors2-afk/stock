import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import LogoutModal from './LogoutModal'; // 👈 Import LogoutModal

const UserManagementPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('userMgmt');
    const [darkMode, setDarkMode] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const icons = {
        menu: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        ),
        userMgmt: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    };

    // Auth check
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
    }, [navigate]);

    // Theme
    useEffect(() => {
        document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Inactivity auto-logout
    useEffect(() => {
        let timeoutId;
        const INACTIVITY_LIMIT = 600000; // 10 mins

        const handleInactivityLogout = () => {
            localStorage.removeItem('user');
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

    // Logout handlers
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        navigate('/', { replace: true });
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className={`db ${darkMode ? 'dark' : 'light'} ${sidebarOpen && !mobileSidebar ? 'sb-open' : 'sb-closed'}`}>

            {/* Mobile Overlay */}
            {mobileSidebar && <div className="mobile-overlay" onClick={() => setMobileSidebar(false)} />}

            {/* Sidebar */}
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
            />

            {/* Main Content */}
            <main className="main">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)}>
                            {icons.menu}
                        </button>
                        <div className="stylish-header">
                            <div className="dash-title-row">
                                <span className="dash-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                    {icons.userMgmt}
                                </span>
                                <div className="dash-title-text">
                                    <h2 className="dash-title">User Management</h2>
                                    <div className="dash-welcome">
                                        <span>Manage Eram Motors Employees</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="topbar-right">
                        {/* Theme Toggle */}
                        <button
                            className={`modern-theme-toggle ${darkMode ? 'is-dark' : 'is-light'}`}
                            onClick={() => setDarkMode(!darkMode)}
                            title="Toggle Theme"
                        >
                            <div className="toggle-bg" />
                            <div className="toggle-icons">
                                <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                                <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            </div>
                            <div className="toggle-knob" />
                        </button>

                        {/* Avatar - triggers logout */}
                        <div className="topbar-avatar" onClick={handleLogoutClick} title="Logout">
                            <span>{userName.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                <div className="content">
                    <UserManagement />
                </div>
            </main>

            {/* ═══ CUTE LOGOUT MODAL ═══ */}
            <LogoutModal
                show={showLogoutModal}
                onCancel={cancelLogout}
                onConfirm={confirmLogout}
            />
        </div>
    );
};

export default UserManagementPage;