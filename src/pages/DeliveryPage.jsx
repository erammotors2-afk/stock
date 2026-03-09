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
    
    // Exact Stock Status UX states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    
    const rowsPerPage = 100;

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

    // Exact filtering mimicking Stock Status
    const filteredDeliveries = deliveries.filter(d => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            (d.customer_name || '').toLowerCase().includes(searchLower) ||
            (d.invoice_no || '').toLowerCase().includes(searchLower) ||
            (d.chassis_no || '').toLowerCase().includes(searchLower) ||
            (d.dealer_location_code || '').toLowerCase().includes(searchLower) ||
            (d.engine_no || '').toLowerCase().includes(searchLower);

        const matchesStatus =
            filterStatus === 'all' ||
            (d.invoice_status || '').toLowerCase().includes(filterStatus.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredDeliveries.length / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const handleAction = (del) => {
        setSelectedDelivery(del);
        setShowActionModal(true);
    };

    const closeActionModal = () => {
        setShowActionModal(false);
        setSelectedDelivery(null);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const handleExcelDownload = () => {
        if (filteredDeliveries.length === 0) return;

        const headers = ['SL No', ...DELIVERY_COLUMNS.map(col => col.label)];
        const rows = filteredDeliveries.map((d, i) => [
            i + 1,
            ...DELIVERY_COLUMNS.map(col => d[col.key] || '-')
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<?mso-application progid="Excel.Sheet"?>';
        xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
        xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
        xml += '<Styles>';
        xml += '<Style ss:ID="header"><Font ss:Bold="1" ss:Size="10"/>';
        xml += '<Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>';
        xml += '<Style ss:ID="cell"><Font ss:Size="9"/></Style>';
        xml += '</Styles>';
        xml += '<Worksheet ss:Name="Delivery">';
        xml += '<Table>';

        headers.forEach(() => {
            xml += '<Column ss:AutoFitWidth="1" ss:Width="110"/>';
        });

        xml += '<Row>';
        headers.forEach(h => {
            xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`;
        });
        xml += '</Row>';

        rows.forEach(row => {
            xml += '<Row>';
            row.forEach((val, ci) => {
                const type = (ci === 0) ? 'Number' : 'String';
                const escaped = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += `<Cell ss:StyleID="cell"><Data ss:Type="${type}">${escaped}</Data></Cell>`;
            });
            xml += '</Row>';
        });

        xml += '</Table></Worksheet></Workbook>';

        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Delivery_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const deliveryCounts = {
        total: filteredDeliveries.length,
        pending: filteredDeliveries.filter(d => (d.invoice_status || '').toLowerCase().includes('pending')).length,
        delivered: filteredDeliveries.filter(d => (d.invoice_status || '').toLowerCase().includes('delivered')).length,
        cancelled: filteredDeliveries.filter(d => (d.invoice_status || '').toLowerCase().includes('cancel')).length,
    };

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
                    <div className="ss-container">
                        
                        {/* ═══ COMBINED HEADER & TOOLBAR ═══ */}
                        <div className="ss-toolbar">
                            <div className="ss-toolbar-left">
                                <div className="dash-title-row" style={{ marginRight: '15px' }}>
                                    {/* Mobile menu button inline with title */}
                                    <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)} style={{ marginRight: '10px', display: window.innerWidth <= 850 ? 'block' : 'none' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="3" y1="12" x2="21" y2="12" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <line x1="3" y1="18" x2="21" y2="18" />
                                        </svg>
                                    </button>
                                    <span className="dash-icon" style={{ background: 'linear-gradient(135deg, #10b981, #047857)', width: '30px', height: '30px', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </span>
                                    <div className="dash-title-text" style={{ marginLeft: '10px' }}>
                                        <h2 className="dash-title" style={{ fontSize: '15px', marginBottom: '2px' }}>Delivery Status</h2>
                                        <div className="dash-welcome" style={{ fontSize: '10.5px' }}>
                                            <span>Real-time logistics view</span>
                                        </div>
                                    </div>
                                </div>

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
                                        <span className="ss-chip-num">{deliveryCounts.total.toLocaleString()}</span>
                                    </div>
                                    <div className="ss-chip ss-chip-free">
                                        <span className="ss-chip-dot"></span>
                                        <span>Pending</span>
                                        <span className="ss-chip-num">{deliveryCounts.pending}</span>
                                    </div>
                                    <div className="ss-chip ss-chip-transit">
                                        <span className="ss-chip-dot"></span>
                                        <span>Delivered</span>
                                        <span className="ss-chip-num">{deliveryCounts.delivered}</span>
                                    </div>
                                    <div className="ss-chip ss-chip-sold">
                                        <span className="ss-chip-dot"></span>
                                        <span>Cancelled</span>
                                        <span className="ss-chip-num">{deliveryCounts.cancelled}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ss-toolbar-right">
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="ss-select">
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <button className="ss-icon-btn ss-excel-btn" onClick={handleExcelDownload} title="Download Excel" disabled={filteredDeliveries.length === 0}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </button>

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
                                <>
                                    <div className="ss-table-wrap">
                                        <table className="ss-table">
                                            <thead>
                                                <tr>
                                                    <th className="th-center">SL No</th>
                                                    <th className="th-center">Action</th>
                                                    {DELIVERY_COLUMNS.map(col => (
                                                        <th key={col.key}>{col.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedDeliveries.map((delivery, idx) => (
                                                    <tr key={delivery.id || idx}>
                                                        <td className="td-center">{startIndex + idx + 1}</td>
                                                        <td className="td-center">
                                                            <button className="ss-action-btn" onClick={() => handleAction(delivery)} title="View">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <circle cx="12" cy="12" r="10" stroke="#10b981" />
                                                                    <line x1="12" y1="8" x2="12" y2="12" stroke="#10b981" />
                                                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="#047857" strokeWidth="3" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                        {DELIVERY_COLUMNS.map(col => {
                                                            const val = delivery[col.key];
                                                            
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
                                    
                                    {/* PAGINATION */}
                                    {totalPages > 1 && (
                                        <div className="ss-pagination">
                                            <span className="ss-pg-info">
                                                {startIndex + 1}–{Math.min(endIndex, filteredDeliveries.length)} of <strong>{filteredDeliveries.length.toLocaleString()}</strong>
                                            </span>
                                            <div className="ss-pg-controls">
                                                <button className="ss-pg-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
                                                </button>
                                                <button className="ss-pg-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
                                                </button>
                                                <div className="ss-pg-nums">
                                                    {getPageNumbers().map((p, i) =>
                                                        p === '...' ? <span key={`d${i}`} className="ss-pg-dots">…</span> :
                                                            <button key={p} className={`ss-pg-num ${currentPage === p ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                                                    )}
                                                </div>
                                                <button className="ss-pg-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6" /></svg>
                                                </button>
                                                <button className="ss-pg-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══ POPUP MODAL ═══ */}
            {showActionModal && selectedDelivery && (
                <div className="ss-overlay" onClick={closeActionModal}>
                    <div className="ss-popup" onClick={e => e.stopPropagation()}>
                        <div className="ss-popup-head">
                            <div className="ss-popup-title">
                                <span className="ss-popup-icon">🚚</span>
                                <div>
                                    <h4>{selectedDelivery.model_group || 'Delivery'}</h4>
                                    <span className="ss-popup-sub">{selectedDelivery.invoice_no || '-'}</span>
                                </div>
                            </div>
                            <button className="ss-popup-close" onClick={closeActionModal}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="ss-popup-body">
                            <div className="ss-popup-tags">
                                <span className="ss-stype stype-free">{selectedDelivery.invoice_status || 'Pending'}</span>
                                <span className="ss-popup-tag">{selectedDelivery.color || '-'}</span>
                                <span className="ss-popup-tag">{selectedDelivery.city || '-'}</span>
                            </div>

                            <div className="ss-popup-grid">
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Customer Name</span>
                                    <span className="ss-popup-val">{selectedDelivery.customer_name || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Locality</span>
                                    <span className="ss-popup-val">{selectedDelivery.locality || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">District</span>
                                    <span className="ss-popup-val">{selectedDelivery.district || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Chassis</span>
                                    <span className="ss-popup-val mono">{selectedDelivery.chassis_no || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Engine No</span>
                                    <span className="ss-popup-val mono">{selectedDelivery.engine_no || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Model Variant</span>
                                    <span className="ss-popup-val">{selectedDelivery.model_variant || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Model Code</span>
                                    <span className="ss-popup-val">{selectedDelivery.model_code || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">SC Name</span>
                                    <span className="ss-popup-val">{selectedDelivery.sc_name || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Financier</span>
                                    <span className="ss-popup-val">{selectedDelivery.financier || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <LogoutModal
                show={showLogoutModal}
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
            />
        </div>
    );
};

export default DeliveryPage;
