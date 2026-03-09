import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './StockStatus.css'; // Inheriting exact styling from Stock Status
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';
import { supabase } from '../config/supabaseClient';

const DELIVERY_COLUMNS = [
    { key: 'customer_gstin_no', label: 'Customer GSTIN No' },
    { key: 'invoice_no', label: 'Invoice No' },
    { key: 'invoice_date', label: 'Invoice Date' },
    { key: 'dealer_parent_code', label: 'Dealer Parent Code' },
    { key: 'dealer_location_code', label: 'Dealer Location Code' },
    { key: 'dealer_name', label: 'Dealer Name' },
    { key: 'sc_code', label: 'SC Code' },
    { key: 'sc_name', label: 'SC Name' },
    { key: 'team_lead', label: 'Team Lead' },
    { key: 'invoice_status', label: 'Invoice Status' },
    { key: 'initial_promised_delivery_date', label: 'Promised Delivery' },
    { key: 'delivery_date', label: 'Delivery Date' },
    { key: 'delivery_note_number', label: 'Delivery Note Number' },
    { key: 'delivery_note_cancelled_reason', label: 'Note Cancelled Reason' },
    { key: 'delivery_note_cancelled_date', label: 'Note Cancelled Date' },
    { key: 'delivery_note_remarks', label: 'Delivery Note Remarks' },
    { key: 'delivery_delay_reason_remarks', label: 'Delay Reason Remarks' },
    { key: 'chassis_no', label: 'Chassis No' },
    { key: 'engine_no', label: 'Engine No' },
    { key: 'registration_number', label: 'Reg Number' },
    { key: 'key_number', label: 'Key Number' },
    { key: 'model_group', label: 'Model Group' },
    { key: 'model', label: 'Model' },
    { key: 'model_variant', label: 'Model Variant' },
    { key: 'seating', label: 'Seating' },
    { key: 'color', label: 'Color' },
    { key: 'model_code', label: 'Model Code' },
    { key: 'demo_vehicle', label: 'Demo Vehicle' },
    { key: 'customer_type', label: 'Customer Type' },
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'address', label: 'Address' },
    { key: 'pin_code', label: 'PIN Code' },
    { key: 'locality', label: 'Locality' },
    { key: 'city', label: 'City' },
    { key: 'tehsil', label: 'Tehsil' },
    { key: 'district', label: 'District' },
    { key: 'mitra_type', label: 'Mitra Type' },
    { key: 'mitra_id', label: 'Mitra ID' },
    { key: 'mitra_name', label: 'Mitra Name' },
    { key: 'shield_scheme_reg_id', label: 'Shield Scheme Reg ID' },
    { key: 'shield_scheme_type', label: 'Shield Scheme Type' },
    { key: 'shield_scheme_reg_date', label: 'Shield Scheme Reg Date' },
    { key: 'shield_scheme_employee_name', label: 'Shield Scheme Emp Name' },
    { key: 'rsa_scheme_reg_id', label: 'RSA Scheme Reg ID' },
    { key: 'rsa_scheme_type', label: 'RSA Scheme Type' },
    { key: 'rsa_scheme_reg_date', label: 'RSA Scheme Reg Date' },
    { key: 'rsa_scheme_employee_name', label: 'RSA Scheme Emp Name' },
    { key: 'amc_scheme_reg_id', label: 'AMC Scheme Reg ID' },
    { key: 'amc_scheme_type', label: 'AMC Scheme Type' },
    { key: 'amc_scheme_reg_date', label: 'AMC Scheme Reg Date' },
    { key: 'amc_scheme_employee_name', label: 'AMC Scheme Emp Name' },
    { key: 'insurance_company', label: 'Insurance Company' },
    { key: 'insurance_cover_note_no', label: 'Insurance Cover Note No' },
    { key: 'insurance_cover_note_date', label: 'Insurance Cover Note Date' },
    { key: 'insurance_note_type', label: 'Insurance Note Type' },
    { key: 'financier', label: 'Financier' },
    { key: 'financier_branch', label: 'Financier Branch' },
    { key: 'finance_amount', label: 'Finance Amount' },
    { key: 'pdi_done_indicator', label: 'PDI Done Indicator' },
    { key: 'bndp_discount_amount', label: 'BNDP Discount Amount' },
    { key: 'bndp_discount_type', label: 'BNDP Discount Type' },
    { key: 'bndp_applicable', label: 'BNDP Applicable' },
    { key: 'kyc_applicable', label: 'KYC Applicable' },
    { key: 'kyc_status', label: 'KYC Status' },
    { key: 'cloud_platform', label: 'Cloud Platform' },
    { key: 'api_status', label: 'API Status' },
    { key: 'upload_date', label: 'Upload Date' }
];

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
        d.chassis_no?.toLowerCase().includes(searchTerm.toLowerCase())
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
                {/* ═══ TOP NAV EXACTLY LIKE STOCK STATUS ═══ */}
                <div className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h1 className="dash-title">Delivery Status</h1>
                    </div>
                </div>

                <div className="content">
                    <div className="ss-container">
                        
                        {/* ═══ FILTER BAR (Exactly like Stock Status) ═══ */}
                        <div className="ss-filter-bar">
                            <div className="ss-toolbar-left">
                                <div className="ss-search-wrap">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search invoice or name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button className="ss-clear-btn" onClick={() => setSearchTerm('')}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="ss-mini-stats">
                                    <div className="ss-chip ss-chip-total">
                                        <span className="ss-chip-dot"></span>
                                        <span>Total</span>
                                        <span className="ss-chip-num">{deliveries.length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ss-toolbar-right">
                                <button className="ss-icon-btn ss-refresh-btn" onClick={fetchDeliveries} title="Refresh">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="23 4 23 10 17 10" />
                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                    </svg>
                                </button>
                                {userName && (
                                    <div className="topbar-avatar" onClick={handleLogoutClick} title="Logout" style={{ marginLeft: '10px' }}>
                                        <span>{userName.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ TABLE CARD ═══ */}
                        <div className="ss-table-card">
                            <div className="ss-rainbow-bar"></div>

                            {isLoading ? (
                                <div className="ss-loading">
                                    <div className="ss-spinner"></div>
                                    <p>Loading Deliveries...</p>
                                </div>
                            ) : filteredDeliveries.length === 0 ? (
                                <div className="ss-empty">
                                    <div className="ss-empty-icon">📋</div>
                                    <p>No deliveries found</p>
                                </div>
                            ) : (
                                <div className="ss-table-wrap">
                                    <table className="ss-table">
                                        <thead>
                                            <tr>
                                                <th className="th-center">SL No</th>
                                                {DELIVERY_COLUMNS.map(col => (
                                                    <th key={col.key}>{col.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDeliveries.map((delivery, idx) => (
                                                <tr key={delivery.id || idx}>
                                                    <td className="td-center">{idx + 1}</td>
                                                    {DELIVERY_COLUMNS.map(col => {
                                                        const val = delivery[col.key];
                                                        
                                                        // Apply specific formatting if needed
                                                        if (col.key === 'chassis_no' || col.key === 'engine_no') {
                                                            return <td key={col.key} className="mono">{val || '-'}</td>;
                                                        }
                                                        if (col.key === 'invoice_status') {
                                                            return (
                                                                <td key={col.key}>
                                                                    <span className="ss-status-badge ss-status-free">
                                                                        {val || 'PENDING'}
                                                                    </span>
                                                                </td>
                                                            );
                                                        }
                                                        if (col.key.includes('date') && val) {
                                                            return <td key={col.key}>{new Date(val).toLocaleDateString()}</td>;
                                                        }

                                                        return <td key={col.key}>{val || '-'}</td>;
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
