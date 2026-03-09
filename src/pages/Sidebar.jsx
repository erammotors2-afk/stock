import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    mobileSidebar,
    setMobileSidebar,
    activeMenu,
    setActiveMenu,
    userRole,
    userName,
    handleLogoutClick,
    darkMode,
    setDarkMode,
}) => {
    const [expandedSubs, setExpandedSubs] = useState({});
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [showGeneral, setShowGeneral] = useState(false); // ★ New state for General menu toggle
    const navigate = useNavigate();
    const location = useLocation();

    // ═══ ICONS ═══
    const icons = {
        dashboard: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
        stockStatus: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
        ),
        stock: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        billing: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),
        delivery: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
        ),
        cancel: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        sapIbnd: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
        sapDone: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
        pending: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        approved: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <polyline points="9 15 11 17 15 13" />
            </svg>
        ),
        pBooking: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
        ),
        bookingList: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
        ),
        summary: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
        sapRetail: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
        dmsRetail: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
        analytics: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
        logs: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
        settings: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        notifications: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
        action: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        changeReq: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
        ),
        about: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
        logout: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
        ),
        chevron: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        ),
        search: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
    };

    // ═══ MENU DEFINITIONS ═══
    const mainMenu = [
        { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard, roles: ['user', 'head', 'admin'], color: 'red', path: '/dashboard' },
        { id: 'stockStatus', label: 'Stock Status', icon: icons.stockStatus, roles: ['user', 'head', 'admin'], color: 'blue', path: '/stock-status' },
        { id: 'billing', label: 'Billing', icon: icons.billing, roles: ['user', 'head', 'admin'], color: 'purple', path: '/billing' },
        { id: 'delivery', label: 'Delivery', icon: icons.delivery, roles: ['user', 'head', 'admin'], color: 'orange', path: '/delivery' },
        { id: 'cancellation', label: 'Cancellation', icon: icons.cancel, roles: ['user', 'head', 'admin'], color: 'pink', path: '/cancellation' },
        { id: 'sapIbnd', label: 'SAP IBND', icon: icons.sapIbnd, roles: ['user', 'head', 'admin'], color: 'teal', path: '/sap-ibnd' },
        { id: 'sapDoneDms', label: 'SAP Done DMS Pend', icon: icons.sapDone, roles: ['user', 'head', 'admin'], color: 'indigo', path: '/sap-done-dms' },
        { id: 'pendingList', label: 'Pending List', icon: icons.pending, roles: ['user', 'head', 'admin'], color: 'yellow', path: '/pending-list' },
        { id: 'approvedList', label: 'Approved List', icon: icons.approved, roles: ['user', 'head', 'admin'], color: 'cyan', path: '/approved-list' },
    ];

    const reportsMenu = [
        {
            id: 'pBooking', label: 'P-Booking', icon: icons.pBooking, roles: ['user', 'head', 'admin'], color: 'violet',
            children: [
                { id: 'bookingList', label: 'Booking List', icon: icons.bookingList, roles: ['user', 'head', 'admin'], path: '/booking-list' },
                { id: 'bookingSummary', label: 'Summary', icon: icons.summary, roles: ['user', 'head', 'admin'], path: '/booking-summary' },
            ]
        },
        {
            id: 'sapRetail', label: 'SAP Retail', icon: icons.sapRetail, roles: ['user', 'head', 'admin'], color: 'lime',
            children: [
                { id: 'retailReport', label: 'Retail Report', icon: icons.sapRetail, roles: ['user', 'head', 'admin'], path: '/retail-report' },
                { id: 'retailSummary', label: 'Summary', icon: icons.summary, roles: ['user', 'head', 'admin'], path: '/retail-summary' },
            ]
        },
        { id: 'dmsRetail', label: 'DMS Retail', icon: icons.dmsRetail, roles: ['user', 'head', 'admin'], color: 'rose', path: '/dms-retail' },
        { id: 'analytics', label: 'Analytics', icon: icons.analytics, roles: ['user', 'head', 'admin'], color: 'emerald', path: '/analytics' },
    ];

    const managementMenu = [
        { id: 'userMgmt', label: 'User Management', icon: icons.userMgmt, roles: ['admin'], badge: 'Admin', color: 'amber', path: '/user-management' },
        { id: 'actionLogs', label: 'Action Logs', icon: icons.logs, roles: ['admin'], badge: 'Admin', color: 'fuchsia', path: '/action-logs' },
        { id: 'notifications', label: 'Notifications', icon: icons.notifications, roles: ['head', 'admin'], badge: 'Head+', color: 'blue', path: '/notifications' },
        { id: 'action', label: 'Action', icon: icons.action, roles: ['head', 'admin'], badge: 'Head+', color: 'red', path: '/action' },
        { id: 'changeRequest', label: 'Change Request', icon: icons.changeReq, roles: ['head', 'admin'], badge: 'Head+', color: 'green', path: '/change-request' },
    ];

    const generalMenu = [
        {
            id: 'settings', label: 'Settings', icon: icons.settings, roles: ['user', 'head', 'admin'], color: 'gray',
            children: [
                { id: 'preferences', label: 'Preferences', icon: icons.settings, roles: ['user', 'head', 'admin'], path: '/preferences' },
                { id: 'account', label: 'Account', icon: icons.userMgmt, roles: ['user', 'head', 'admin'], path: '/account' },
            ]
        },
        { id: 'about', label: 'About', icon: icons.about, roles: ['user', 'head', 'admin'], color: 'gray', path: '/about' },
    ];

    // ═══ HANDLERS ═══
    const toggleSubmenu = (id) => {
        setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleMenuClick = (item) => {
        if (item.children) {
            toggleSubmenu(item.id);
            if (!sidebarOpen && window.innerWidth > 850) setSidebarOpen(true);
        } else {
            setActiveMenu(item.id);

            // Navigate to path if defined
            if (item.path) {
                navigate(item.path);
            }

            setMobileSidebar(false);
            setSidebarOpen(false);
        }
    };

    const onLogoutClick = () => {
        if (window.innerWidth <= 850) {
            setMobileSidebar(false);
        }
        handleLogoutClick();
    };

    // ═══ FILTER BY ROLE & SEARCH ═══
    const filterMenu = (items) => {
        return items.filter(item => {
            const hasRole = item.roles.includes(userRole);
            if (!hasRole) return false;

            if (sidebarSearch) {
                const term = sidebarSearch.toLowerCase();
                const matchesParent = item.label.toLowerCase().includes(term);
                const matchesChild = item.children && item.children.some(c => c.label.toLowerCase().includes(term));
                return matchesParent || matchesChild;
            }
            return true;
        });
    };

    // ═══ RENDER MENU ITEM ═══
    const renderMenuItem = (item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isSearchingChildMatch = sidebarSearch && hasChildren && item.children.some(c => c.label.toLowerCase().includes(sidebarSearch.toLowerCase()));
        const isExpanded = expandedSubs[item.id] || isSearchingChildMatch;

        // Check if current path matches
        const isActive = item.path === location.pathname ||
            activeMenu === item.id ||
            (hasChildren && item.children.some(c => c.path === location.pathname || activeMenu === c.id));

        return (
            <div key={item.id} className="sb-menu-group">
                <button
                    className={`sb-item ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                    onClick={() => handleMenuClick(item)}
                    title={item.label}
                >
                    <span className={`sb-icon icon-${item.color}`}>{item.icon}</span>
                    {(sidebarOpen || mobileSidebar) && (
                        <span className="sb-text">{item.label}</span>
                    )}
                    {(sidebarOpen || mobileSidebar) && item.badge && (
                        <span className={`sb-role-badge rb-${item.badge.toLowerCase().replace('+', '')}`}>
                            {item.badge}
                        </span>
                    )}
                    {(sidebarOpen || mobileSidebar) && hasChildren && (
                        <span className={`sb-chevron ${isExpanded ? 'expanded' : ''}`}>
                            {icons.chevron}
                        </span>
                    )}
                </button>

                {hasChildren && (sidebarOpen || mobileSidebar) && (
                    <div className={`sb-submenu ${isExpanded ? 'open' : ''}`}>
                        {item.children
                            .filter(c => c.roles.includes(userRole))
                            .filter(c => !sidebarSearch || c.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
                            .map(child => (
                                <button
                                    key={child.id}
                                    className={`sb-sub-item ${child.path === location.pathname || activeMenu === child.id ? 'active' : ''}`}
                                    onClick={() => handleMenuClick(child)}
                                    title={child.label}
                                >
                                    <span className="sb-sub-dot" />
                                    <span className="sb-text">{child.label}</span>
                                </button>
                            ))}
                    </div>
                )}
            </div>
        );
    };

    // ═══ RENDER ═══
    return (
        <aside className={`sidebar ${mobileSidebar ? 'mobile-show' : ''}`}>

            {/* ═══ HEADER ═══ */}
            <div className="sb-top">
                {(sidebarOpen || mobileSidebar) ? (
                    <div className="sb-brand-expanded">
                        <div className="sb-brand-text">
                            <h3>ERAM MOTORS</h3>
                            <span>Stock Tracker</span>
                        </div>
                    </div>
                ) : (
                    <div className="sb-brand-collapsed">
                        <div className="sb-collapsed-letter">E</div>
                    </div>
                )}

                <button
                    className="sb-toggle"
                    onClick={() => {
                        if (mobileSidebar) {
                            setMobileSidebar(false);
                        } else {
                            setSidebarOpen(!sidebarOpen);
                        }
                    }}
                    title={sidebarOpen ? 'Collapse' : 'Expand'}
                >
                    {mobileSidebar ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toggle-chevron">
                            {sidebarOpen
                                ? <polyline points="15 18 9 12 15 6" />
                                : <polyline points="9 18 15 12 9 6" />
                            }
                        </svg>
                    )}
                </button>
            </div>

            {/* ═══ SEARCH ═══ */}
            <div className="sb-search-wrap">
                {!(sidebarOpen || mobileSidebar) ? (
                    <button
                        className="sb-search-btn"
                        onClick={() => {
                            if (window.innerWidth > 850) setSidebarOpen(true);
                        }}
                        title="Search"
                    >
                        {icons.search}
                    </button>
                ) : (
                    <div className="sb-search-inner">
                        <span className="sb-search-icon">{icons.search}</span>
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={sidebarSearch}
                            onChange={(e) => setSidebarSearch(e.target.value)}
                            autoFocus={false}
                        />
                        {sidebarSearch && (
                            <button className="sb-search-clear" onClick={() => setSidebarSearch('')} title="Clear">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>


            {/* ═══ NAVIGATION ═══ */}
            <nav className="sb-nav">
                {/* MAIN */}
                <span className="sb-label">
                    {(sidebarOpen || mobileSidebar) ? 'MAIN' : '•••'}
                </span>
                {filterMenu(mainMenu).map(renderMenuItem)}

                {/* REPORTS */}
                {filterMenu(reportsMenu).length > 0 && (
                    <>
                        <span className="sb-label">
                            {(sidebarOpen || mobileSidebar) ? 'REPORTS' : '📊'}
                        </span>
                        {filterMenu(reportsMenu).map(renderMenuItem)}
                    </>
                )}

                {/* MANAGEMENT */}
                {filterMenu(managementMenu).length > 0 && (
                    <>
                        <span className="sb-label">
                            {(sidebarOpen || mobileSidebar) ? 'MANAGEMENT' : '⚙'}
                        </span>
                        {filterMenu(managementMenu).map(renderMenuItem)}
                    </>
                )}
            </nav>

            {/* ═══ BOTTOM ═══ */}
            <div className="sb-bottom">
                {/* GENERAL (Hidden behind toggle) */}
                {showGeneral && (
                    <>
                        <span className="sb-label">
                            {(sidebarOpen || mobileSidebar) ? 'GENERAL' : 'ℹ'}
                        </span>
                        {filterMenu(generalMenu).map(renderMenuItem)}
                    </>
                )}

                {/* DARK MODE TOGGLE */}
                <button
                    className={`sb-item sb-darkmode-toggle ${darkMode ? 'is-dark' : ''}`}
                    onClick={() => setDarkMode && setDarkMode(!darkMode)}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <span className="sb-icon icon-gray">
                        {darkMode ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </span>
                    {(sidebarOpen || mobileSidebar) && (
                        <span className="sb-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    )}
                    {(sidebarOpen || mobileSidebar) && (
                        <span className={`sb-dm-badge ${darkMode ? 'dm-on' : 'dm-off'}`}>
                            {darkMode ? 'ON' : 'OFF'}
                        </span>
                    )}
                </button>

                {/* LOGOUT */}
                <button
                    className="sb-item logout"
                    onClick={onLogoutClick}
                    title="Logout"
                >
                    <span className="sb-icon icon-red">{icons.logout}</span>
                    {(sidebarOpen || mobileSidebar) && (
                        <span className="sb-text">Logout</span>
                    )}
                </button>

                {/* USER CARD (Click to toggle GENERAL) */}
                {(sidebarOpen || mobileSidebar) && (
                    <div className="sb-user" onClick={() => setShowGeneral(!showGeneral)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} title="Click to show/hide General menu">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="sb-avatar">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="sb-user-info">
                                <strong>{userName}</strong>
                                <span className="sb-role-tag">
                                    {userRole.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', display: 'flex' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;