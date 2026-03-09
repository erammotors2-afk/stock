import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import StockStatus from './StockStatus';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';

const StockStatusPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('stockStatus');
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
        stockStatus: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
        ),
    };

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


    useEffect(() => {
        let timeoutId;
        const INACTIVITY_LIMIT = 600000;
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

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        navigate('/', { replace: true });
    };

    const cancelLogout = () => setShowLogoutModal(false);

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
                                <span className="dash-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                                    {icons.stockStatus}
                                </span>
                                <div className="dash-title-text">
                                    <h2 className="dash-title">Stock Status</h2>
                                    <div className="dash-welcome">
                                        <span>Real-time vehicle inventory</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="topbar-right">
                        <div className="topbar-avatar" onClick={handleLogoutClick} title="Logout">
                            <span>{userName.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                <div className="content">
                    <StockStatus />
                </div>
            </main>

            <LogoutModal
                show={showLogoutModal}
                onCancel={cancelLogout}
                onConfirm={confirmLogout}
            />
        </div>
    );
};

export default StockStatusPage;