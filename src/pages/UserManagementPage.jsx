import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';

const UserManagementPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('userMgmt');
    const [darkMode, setDarkMode] = useDarkMode();
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


    // Inactivity auto-logout
    useEffect(() => {
        let timeoutId;
        const INACTIVITY_LIMIT = 600000; // 10 mins

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

    // Logout handlers
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loginExpiry');
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
                darkMode={darkMode}
                setDarkMode={setDarkMode}
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
