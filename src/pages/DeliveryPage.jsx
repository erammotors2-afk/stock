import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './DeliveryPage.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';
import { supabase } from '../config/supabaseClient';

const DeliveryPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('delivery');
    const [darkMode, setDarkMode] = useDarkMode();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const [deliveries, setDeliveries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('delivery')
                .select('*')
                .limit(100);

            if (error) throw error;
            setDeliveries(data || []);
        } catch (error) {
            console.error('Error fetching deliveries from Supabase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        navigate('/', { replace: true });
    };

    const cancelLogout = () => setShowLogoutModal(false);

    const filteredDeliveries = deliveries.filter(d =>
        d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.model?.toLowerCase().includes(searchTerm.toLowerCase())
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

            <div className="main">
                <div className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h1 className="dash-title">Delivery Management</h1>
                    </div>
                </div>

                <div className="content">
                    <div className="dp-container">
                        <div className="dp-header">
                            <div className="dp-title-area">
                                <div className="dp-icon">🚚</div>
                                <div>
                                    <h2 className="dp-title">Delivery Status</h2>
                                    <p className="dp-subtitle">Overview of vehicle deliveries and logistics</p>
                                </div>
                            </div>
                            
                            <div className="dp-actions">
                                <div className="dp-search">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by name, invoice..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="dp-btn-refresh" onClick={fetchDeliveries}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="dp-card">
                            <div className="dp-table-wrap">
                                {isLoading ? (
                                    <div className="dp-loading">
                                        <div className="dp-spinner"></div>
                                        <p>Loading deliveries...</p>
                                    </div>
                                ) : (
                                    <table className="dp-table">
                                        <thead>
                                            <tr>
                                                <th>Invoice No</th>
                                                <th>Date</th>
                                                <th>Customer Name</th>
                                                <th>Model</th>
                                                <th>Color</th>
                                                <th>Chassis No</th>
                                                <th>Status</th>
                                                <th>Location</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDeliveries.map((d, idx) => (
                                                <tr key={d.id || idx}>
                                                    <td><strong>{d.invoice_no || '-'}</strong></td>
                                                    <td>{d.invoice_date ? new Date(d.invoice_date).toLocaleDateString() : '-'}</td>
                                                    <td>{d.customer_name || '-'}</td>
                                                    <td>{d.model || '-'}</td>
                                                    <td>{d.color || '-'}</td>
                                                    <td className="mono">{d.chassis_no || '-'}</td>
                                                    <td>
                                                        <span className={`dp-status badge-${d.invoice_status?.toLowerCase().replace(/\s+/g, '-') || 'pending'}`}>
                                                            {d.invoice_status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>{d.dealer_location_code || '-'}</td>
                                                </tr>
                                            ))}
                                            {filteredDeliveries.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="dp-empty">
                                                        No deliveries found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LogoutModal
                show={showLogoutModal}
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
            />
        </div>
    );
};

export default DeliveryPage;
