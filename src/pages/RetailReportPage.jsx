import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './StockStatus.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';
import { supabase } from '../config/supabaseClient';

const RETAIL_COLUMNS = [
    { key: 'sapinvoicedate', label: 'SAP Invoice Date' },
    { key: 'sapinvoiceno', label: 'SAP Invoice No' },
    { key: 'dmsinvoicenumber', label: 'DMS Invoice No' },
    { key: 'customercode', label: 'Customer Code' },
    { key: 'customername', label: 'Customer Name' },
    { key: 'branch', label: 'Branch' },
    { key: 'model', label: 'Model' },
    { key: 'itemcode', label: 'Item Code' },
    { key: 'variant', label: 'Variant' },
    { key: 'process', label: 'Process' },
    { key: 'colour', label: 'Colour' },
    { key: 'chassisnumber', label: 'Chassis No' },
    { key: 'engineno', label: 'Engine No' },
    { key: 'invoicetotal', label: 'Invoice Total' },
    { key: 'salevaluebeforedisc', label: 'Sale Val Bef Disc' },
    { key: 'discount', label: 'Discount' },
    { key: 'dealerdiscount', label: 'Dealer Discount' },
    { key: 'salevalueafterdisc', label: 'Sale Val Aft Disc' },
    { key: 'purchasevalue', label: 'Purchase Value' },
    { key: 'purchasedate', label: 'Purchase Date' },
    { key: 'margin', label: 'Margin' },
    { key: 'percentage', label: 'Percentage' },
    { key: 'financecompany', label: 'Finance Company' },
    { key: 'referenceno', label: 'Reference No' },
    { key: 'sc_name', label: 'SC Name' },
    { key: 'mile_id', label: 'Mile ID' },
    { key: 'invoicelink', label: 'Invoice Link' },
    { key: 'uploaded_at', label: 'Uploaded At' }
];

const ROW_SIZE = 100;

const RetailReportPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('retailReport');
    const [darkMode, setDarkMode] = useDarkMode();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const [retailData, setRetailData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                localStorage.removeItem('user');
                navigate('/', { replace: true });
            }, INACTIVITY_LIMIT);
        };
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    const fetchRetailData = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const from = (page - 1) * ROW_SIZE;
            const to = from + ROW_SIZE - 1;

            // ── Data query: only fetch current page ──
            let dataQuery = supabase
                .from('net_sale')
                .select('*')
                .order('uploaded_at', { ascending: false })
                .range(from, to);

            if (search) {
                dataQuery = dataQuery.or(
                    `customername.ilike.%${search}%,sapinvoiceno.ilike.%${search}%,dmsinvoicenumber.ilike.%${search}%,chassisnumber.ilike.%${search}%,engineno.ilike.%${search}%`
                );
            }

            // ── Count query: lightweight estimated count (no data transfer) ──
            let countQuery = supabase
                .from('net_sale')
                .select('id', { count: 'estimated', head: true });

            if (search) {
                countQuery = countQuery.or(
                    `customername.ilike.%${search}%,sapinvoiceno.ilike.%${search}%,dmsinvoicenumber.ilike.%${search}%,chassisnumber.ilike.%${search}%,engineno.ilike.%${search}%`
                );
            }

            // Run both in parallel
            const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);

            if (dataResult.error) throw dataResult.error;

            setRetailData(dataResult.data || []);
            setTotalCount(countResult.count || 0);
        } catch (error) {
            console.error('Error fetching retail data from Supabase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRetailData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleSearch = () => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        if (window.innerWidth <= 850) setMobileSidebar(false);
    };
    const confirmLogout = () => { localStorage.removeItem('user'); navigate('/', { replace: true }); };
    const cancelLogout = () => setShowLogoutModal(false);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'null') return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const totalPages = Math.ceil(totalCount / ROW_SIZE) || 1;
    const startIndex = (currentPage - 1) * ROW_SIZE;

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
                        <div className="ss-toolbar">
                            <div className="ss-toolbar-left">
                                <div className="dash-title-row" style={{ marginRight: '15px' }}>
                                    <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)} style={{ marginRight: '10px', display: window.innerWidth <= 850 ? 'block' : 'none' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
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
                                        <h2 className="dash-title" style={{ fontSize: '15px', marginBottom: '2px' }}>SAP Retail Report</h2>
                                        <div className="dash-welcome" style={{ fontSize: '10.5px' }}><span>Net Sale Data Viewer</span></div>
                                    </div>
                                </div>

                                <div className="ss-search-wrap">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search name, invoice, chassis..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    {searchInput && (
                                        <button className="ss-clear-btn" onClick={handleClearSearch}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                    <button onClick={handleSearch} style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', marginLeft: '4px' }}>Search</button>
                                </div>

                                <div className="ss-mini-stats">
                                    <div className="ss-chip ss-chip-total">
                                        <span className="ss-chip-dot"></span>
                                        <span>Total</span>
                                        <span className="ss-chip-num">{totalCount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="ss-toolbar-right">
                                <button className="ss-icon-btn ss-refresh-btn" onClick={() => fetchRetailData(currentPage, searchTerm)} title="Refresh">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                    </svg>
                                </button>
                                {userName && (
                                    <div className="topbar-avatar" onClick={handleLogoutClick} title="Logout" style={{ marginLeft: '10px' }}>
                                        <span>{userName.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ss-table-card">
                            <div className="ss-rainbow-bar"></div>

                            {isLoading ? (
                                <div className="ss-loading">
                                    <div className="ss-spinner"></div>
                                    <p>Loading Retail Data...</p>
                                </div>
                            ) : retailData.length === 0 ? (
                                <div className="ss-empty">
                                    <div className="ss-empty-icon">📊</div>
                                    <p>No retail sales found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="ss-table-wrap">
                                        <table className="ss-table">
                                            <thead>
                                                <tr>
                                                    <th className="th-center">SL No</th>
                                                    {RETAIL_COLUMNS.map(col => (
                                                        <th key={col.key}>{col.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {retailData.map((row, idx) => (
                                                    <tr key={row.id || idx}>
                                                        <td className="td-center">{startIndex + idx + 1}</td>
                                                        {RETAIL_COLUMNS.map(col => {
                                                            const val = row[col.key];
                                                            if (col.key === 'chassisnumber' || col.key === 'engineno') {
                                                                return <td key={col.key} className="mono">{val || '-'}</td>;
                                                            }
                                                            if (col.key === 'invoicelink' && val) {
                                                                return (
                                                                    <td key={col.key}>
                                                                        <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>View</a>
                                                                    </td>
                                                                );
                                                            }
                                                            if ((col.key.includes('date') || col.key === 'uploaded_at') && val) {
                                                                return <td key={col.key}>{formatDate(val)}</td>;
                                                            }
                                                            return <td key={col.key}>{val ?? '-'}</td>;
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="ss-pagination">
                                            <span className="ss-pg-info">
                                                {startIndex + 1}–{Math.min(startIndex + ROW_SIZE, totalCount)} of <strong>{totalCount.toLocaleString()}</strong>
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

            <LogoutModal show={showLogoutModal} onCancel={cancelLogout} onConfirm={confirmLogout} />
        </div>
    );
};

export default RetailReportPage;
