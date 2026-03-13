import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './StockStatus.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import useDarkMode from '../hooks/useDarkMode';
import { supabase } from '../config/supabaseClient';

const ROW_SIZE = 100;

const BillingPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        try { const p = localStorage.getItem('userPreferences'); return p ? !!JSON.parse(p).sidebarDefaultOpen : false; } catch { return false; }
    });
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [activeMenu, setActiveMenu] = useState('billing');
    const [darkMode, setDarkMode] = useDarkMode();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserRole(parsedUser.role || 'user');
            let nameToDisplay = parsedUser.full_name || parsedUser.username || 'User';
            if (nameToDisplay.includes('@') && /\d/.test(nameToDisplay)) nameToDisplay = parsedUser.username || 'User';
            setUserName(nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1));
        } else { navigate('/', { replace: true }); }
    }, [navigate]);

    useEffect(() => {
        let timeoutId;
        const INACTIVITY_LIMIT = 600000;
        const resetTimer = () => { clearTimeout(timeoutId); timeoutId = setTimeout(() => { localStorage.removeItem('user'); localStorage.removeItem('loginExpiry'); navigate('/', { replace: true }); }, INACTIVITY_LIMIT); };
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        resetTimer();
        return () => { clearTimeout(timeoutId); events.forEach(e => window.removeEventListener(e, resetTimer)); };
    }, [navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('billing').select('*').order('id', { ascending: false }).limit(5000);
            if (error) throw error;
            const rows = data || [];
            if (rows.length > 0) {
                const cols = Object.keys(rows[0]).filter(k => k !== 'id');
                setColumns(cols);
            }
            setTableData(rows);
        } catch (error) { console.error('Error fetching billing data:', error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogoutClick = () => { setShowLogoutModal(true); if (window.innerWidth <= 850) setMobileSidebar(false); };
    const confirmLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('loginExpiry'); navigate('/', { replace: true }); };
    const cancelLogout = () => setShowLogoutModal(false);

    const formatDate = (dateStr) => {
        if (!dateStr || String(dateStr).toLowerCase() === 'null') return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    };

    const formatHeader = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const filteredData = tableData.filter(row => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return columns.some(col => String(row[col] || '').toLowerCase().includes(s));
    });

    const sortedData = React.useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null && sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                
                // Handle nulls
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';
                
                // Handle numbers
                if (!isNaN(aValue) && !isNaN(bValue) && aValue !== '' && bValue !== '') {
                    return sortConfig.direction === 'asc' 
                        ? Number(aValue) - Number(bValue)
                        : Number(bValue) - Number(aValue);
                }
                
                // Handle strings
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / ROW_SIZE) || 1;
    const startIndex = (currentPage - 1) * ROW_SIZE;
    const paginatedData = sortedData.slice(startIndex, startIndex + ROW_SIZE);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
        else if (currentPage <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
        else if (currentPage >= totalPages - 2) { pages.push(1); pages.push('...'); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i); }
        else { pages.push(1); pages.push('...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
        return pages;
    };

    const handleExcelDownload = () => {
        if (filteredData.length === 0) return;
        const headers = ['SL No', ...columns.map(formatHeader)];
        const rows = filteredData.map((d, i) => [i + 1, ...columns.map(col => { const val = d[col]; if (col.includes('date') && val) return formatDate(val); return val || '-'; })]);
        let xml = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>';
        xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
        xml += '<Styles><Style ss:ID="header"><Font ss:Bold="1" ss:Size="10"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style><Style ss:ID="cell"><Font ss:Size="9"/></Style></Styles>';
        xml += '<Worksheet ss:Name="Billing"><Table>';
        headers.forEach(() => { xml += '<Column ss:AutoFitWidth="1" ss:Width="110"/>'; });
        xml += '<Row>'; headers.forEach(h => { xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`; }); xml += '</Row>';
        rows.forEach(row => { xml += '<Row>'; row.forEach((val, ci) => { const type = ci === 0 ? 'Number' : 'String'; const escaped = String(val).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); xml += `<Cell ss:StyleID="cell"><Data ss:Type="${type}">${escaped}</Data></Cell>`; }); xml += '</Row>'; });
        xml += '</Table></Worksheet></Workbook>';
        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `Billing_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    return (
        <div className={`db ${darkMode ? 'dark' : 'light'} ${sidebarOpen && !mobileSidebar ? 'sb-open' : 'sb-closed'}`}>
            {mobileSidebar && <div className="mobile-overlay" onClick={() => setMobileSidebar(false)} />}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileSidebar={mobileSidebar} setMobileSidebar={setMobileSidebar} activeMenu={activeMenu} setActiveMenu={setActiveMenu} userRole={userRole} userName={userName} handleLogoutClick={handleLogoutClick} darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="main">
                <div className="content" style={{ padding: '10px 14px' }}>
                    <div className="ss-container">
                        <div className="ss-toolbar">
                            <div className="ss-toolbar-left">
                                <div className="dash-title-row" style={{ marginRight: '15px' }}>
                                    <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)} style={{ marginRight: '10px', display: window.innerWidth <= 850 ? 'block' : 'none' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                                    </button>
                                    <span className="dash-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', width: '30px', height: '30px', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                    </span>
                                    <div className="dash-title-text" style={{ marginLeft: '10px' }}>
                                        <h2 className="dash-title" style={{ fontSize: '15px', marginBottom: '2px' }}>Billing</h2>
                                        <div className="dash-welcome" style={{ fontSize: '10.5px' }}><span>Billing records from Supabase</span></div>
                                    </div>
                                </div>
                                <div className="ss-search-wrap">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    {searchTerm && (<button className="ss-clear-btn" onClick={() => setSearchTerm('')}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>)}
                                </div>
                                <div className="ss-mini-stats">
                                    <div className="ss-chip ss-chip-total"><span className="ss-chip-dot"></span><span>Total</span><span className="ss-chip-num">{filteredData.length.toLocaleString()}</span></div>
                                </div>
                            </div>
                            <div className="ss-toolbar-right">
                                <button className="ss-icon-btn ss-excel-btn" onClick={handleExcelDownload} title="Download Excel" disabled={filteredData.length === 0}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                </button>
                                <button className="ss-icon-btn ss-refresh-btn" onClick={fetchData} title="Refresh">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                                </button>
                                {userName && (<div className="topbar-avatar" onClick={handleLogoutClick} title="Logout" style={{ marginLeft: '10px' }}><span>{userName.charAt(0).toUpperCase()}</span></div>)}
                            </div>
                        </div>
                        <div className="ss-table-card">
                            <div className="ss-rainbow-bar"></div>
                            {isLoading ? (<div className="ss-loading"><div className="ss-spinner"></div><p>Loading Billing...</p></div>)
                            : filteredData.length === 0 ? (<div className="ss-empty"><div className="ss-empty-icon">💳</div><p>No billing records found</p></div>)
                            : (<>
                                <div className="ss-table-wrap">
                                    <table className="ss-table">
                                        <thead>
                                            <tr>
                                                <th className="th-center">SL No</th>
                                                {columns.map(col => (
                                                    <th key={col} onClick={() => requestSort(col)} style={{ cursor: 'pointer' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            {formatHeader(col)}
                                                            <span style={{ opacity: sortConfig.key === col ? 1 : 0.3, fontSize: '10px', marginLeft: '4px' }}>
                                                                {sortConfig.key === col && sortConfig.direction === 'desc' ? '▼' : '▲'}
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((row, idx) => (
                                                <tr key={row.id || idx}>
                                                    <td className="td-center">{startIndex + idx + 1}</td>
                                                    {columns.map(col => {
                                                        const val = row[col];
                                                        if (col.includes('date') && val) return <td key={col}>{formatDate(val)}</td>;
                                                        return <td key={col}>{val ?? '-'}</td>;
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="ss-pagination">
                                        <span className="ss-pg-info">{startIndex + 1}–{Math.min(startIndex + ROW_SIZE, filteredData.length)} of <strong>{filteredData.length.toLocaleString()}</strong></span>
                                        <div className="ss-pg-controls">
                                            <button className="ss-pg-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg></button>
                                            <button className="ss-pg-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg></button>
                                            <div className="ss-pg-nums">{getPageNumbers().map((p, i) => p === '...' ? <span key={`d${i}`} className="ss-pg-dots">…</span> : <button key={p} className={`ss-pg-num ${currentPage === p ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>)}</div>
                                            <button className="ss-pg-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6" /></svg></button>
                                            <button className="ss-pg-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg></button>
                                        </div>
                                    </div>
                                )}
                            </>)}
                        </div>
                    </div>
                </div>
            </main>
            <LogoutModal show={showLogoutModal} onCancel={cancelLogout} onConfirm={confirmLogout} />
        </div>
    );
};

export default BillingPage;
