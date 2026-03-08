import React, { useState, useEffect } from 'react';
import './StockStatus.css';
import { supabase } from '../config/supabaseClient';

const StockStatus = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStock, setSelectedStock] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);

    const rowsPerPage = 100;

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('stock')
                .select('*')
                .order('upload_date', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
            }

            if (data) {
                setStocks(data);
            }
        } catch (err) {
            console.error('Error fetching stocks:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStocks = stocks.filter(stock => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            (stock.model_group || '').toLowerCase().includes(searchLower) ||
            (stock.variant_desc || '').toLowerCase().includes(searchLower) ||
            (stock.chassis_number || '').toLowerCase().includes(searchLower) ||
            (stock.color || '').toLowerCase().includes(searchLower) ||
            (stock.dealer_location_name || '').toLowerCase().includes(searchLower) ||
            (stock.vin || '').toLowerCase().includes(searchLower) ||
            (stock.engine_number || '').toLowerCase().includes(searchLower) ||
            (stock.oem_invoice_number || '').toLowerCase().includes(searchLower);

        const matchesStatus =
            filterStatus === 'all' ||
            (stock.stock_type || '').toLowerCase().includes(filterStatus.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredStocks.length / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    const getAgeingClass = (days) => {
        const d = parseInt(days) || 0;
        if (d <= 15) return 'age-green';
        if (d <= 30) return 'age-yellow';
        if (d <= 60) return 'age-orange';
        return 'age-red';
    };

    const getStockTypeClass = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('free') || t.includes('stock')) return 'stype-free';
        if (t.includes('allot')) return 'stype-allotted';
        if (t.includes('transit')) return 'stype-transit';
        if (t.includes('sold')) return 'stype-sold';
        return 'stype-default';
    };

    const handleAction = (stock) => {
        setSelectedStock(stock);
        setShowActionModal(true);
    };

    const closeActionModal = () => {
        setShowActionModal(false);
        setSelectedStock(null);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // ═══ EXCEL DOWNLOAD — NO EXTERNAL LIBRARY ═══
    const handleExcelDownload = () => {
        if (filteredStocks.length === 0) return;

        const headers = [
            'SL No', 'Model Group', 'Variant', 'Color', 'Seating', 'Model Year',
            'Model Code', 'Chassis Number', 'VIN', 'Engine Number', 'Age',
            'Stock Type', 'Dealer Location', 'OEM Invoice No', 'OEM Invoice Date',
            'Invoice ID', 'Invoice Date', 'SO Number', 'GRN No', 'GRN Date'
        ];

        const rows = filteredStocks.map((s, i) => [
            i + 1,
            s.model_group || '-',
            s.variant_desc || '-',
            s.color || '-',
            s.seating || '-',
            s.emission || '-',
            s.model_code || '-',
            s.chassis_number || '-',
            s.vin || '-',
            s.engine_number || '-',
            s.ageing || 0,
            s.stock_type || '-',
            s.dealer_location_name || '-',
            s.oem_invoice_number || '-',
            formatDate(s.oem_invoice_date),
            s.invoice_id || '-',
            formatDate(s.invoice_date),
            s.so_number || '-',
            s.grn_no || '-',
            formatDate(s.grn_date),
        ]);

        // Build XML-based Excel file (works in all browsers, opens in Excel)
        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<?mso-application progid="Excel.Sheet"?>';
        xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
        xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
        xml += '<Styles>';
        xml += '<Style ss:ID="header"><Font ss:Bold="1" ss:Size="10"/>';
        xml += '<Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>';
        xml += '<Style ss:ID="cell"><Font ss:Size="9"/></Style>';
        xml += '</Styles>';
        xml += '<Worksheet ss:Name="Stock Status">';
        xml += '<Table>';

        // Column widths
        headers.forEach(() => {
            xml += '<Column ss:AutoFitWidth="1" ss:Width="110"/>';
        });

        // Header row
        xml += '<Row>';
        headers.forEach(h => {
            xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`;
        });
        xml += '</Row>';

        // Data rows
        rows.forEach(row => {
            xml += '<Row>';
            row.forEach((val, ci) => {
                const type = (ci === 0 || ci === 10) ? 'Number' : 'String';
                const escaped = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += `<Cell ss:StyleID="cell"><Data ss:Type="${type}">${escaped}</Data></Cell>`;
            });
            xml += '</Row>';
        });

        xml += '</Table></Worksheet></Workbook>';

        // Download
        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Stock_Status_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    const stockCounts = {
        total: filteredStocks.length,
        free: filteredStocks.filter(s => (s.stock_type || '').toLowerCase().includes('free') || (s.stock_type || '').toLowerCase().includes('stock')).length,
        allotted: filteredStocks.filter(s => (s.stock_type || '').toLowerCase().includes('allot')).length,
        transit: filteredStocks.filter(s => (s.stock_type || '').toLowerCase().includes('transit')).length,
    };

    return (
        <div className="ss-container">
            {/* ═══ TOOLBAR ═══ */}
            <div className="ss-toolbar">
                <div className="ss-toolbar-left">
                    <div className="ss-search-wrap">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search..."
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
                            <span className="ss-chip-num">{stockCounts.total.toLocaleString()}</span>
                        </div>
                        <div className="ss-chip ss-chip-free">
                            <span className="ss-chip-dot"></span>
                            <span className="ss-chip-num">{stockCounts.free}</span>
                        </div>
                        <div className="ss-chip ss-chip-allot">
                            <span className="ss-chip-dot"></span>
                            <span className="ss-chip-num">{stockCounts.allotted}</span>
                        </div>
                        <div className="ss-chip ss-chip-transit">
                            <span className="ss-chip-dot"></span>
                            <span className="ss-chip-num">{stockCounts.transit}</span>
                        </div>
                    </div>
                </div>

                <div className="ss-toolbar-right">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="ss-select">
                        <option value="all">All</option>
                        <option value="free">Free</option>
                        <option value="allot">Allotted</option>
                        <option value="transit">Transit</option>
                        <option value="sold">Sold</option>
                    </select>

                    <button className="ss-icon-btn ss-excel-btn" onClick={handleExcelDownload} title="Download Excel" disabled={filteredStocks.length === 0}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </button>

                    <button className="ss-icon-btn ss-refresh-btn" onClick={fetchStocks} title="Refresh">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ═══ TABLE ═══ */}
            <div className="ss-table-card">
                <div className="ss-rainbow-bar"></div>

                {loading ? (
                    <div className="ss-loading">
                        <div className="ss-spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : filteredStocks.length === 0 ? (
                    <div className="ss-empty">
                        <div className="ss-empty-icon">📋</div>
                        <p>No vehicles found</p>
                    </div>
                ) : (
                    <>
                        <div className="ss-table-wrap">
                            <table className="ss-table">
                                <thead>
                                    <tr>
                                        <th className="th-center">SL No</th>
                                        <th className="th-center">Action</th>
                                        <th>Model Group</th>
                                        <th>Variant Description</th>
                                        <th>Color</th>
                                        <th className="th-center">Seat</th>
                                        <th className="th-center">MY</th>
                                        <th>Model Code</th>
                                        <th>Chassis Number</th>
                                        <th>VIN</th>
                                        <th>Engine Number</th>
                                        <th className="th-center">Age</th>
                                        <th>Stock Type</th>
                                        <th>Dealer Location</th>
                                        <th>OEM Invoice No</th>
                                        <th>OEM Inv Date</th>
                                        <th>Invoice ID</th>
                                        <th>Invoice Date</th>
                                        <th>SO Number</th>
                                        <th>GRN No</th>
                                        <th>GRN Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStocks.map((stock, idx) => (
                                        <tr key={stock.id || idx}>
                                            <td className="td-center">{startIndex + idx + 1}</td>
                                            <td className="td-center">
                                                <button className="ss-action-btn" onClick={() => handleAction(stock)} title="View">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" stroke="#6366f1" />
                                                        <line x1="12" y1="8" x2="12" y2="12" stroke="#6366f1" />
                                                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ec4899" strokeWidth="3" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td>{stock.model_group || '-'}</td>
                                            <td>{stock.variant_desc || '-'}</td>
                                            <td>
                                                <span className="ss-color-cell">
                                                    <span className="ss-color-dot" style={{
                                                        background:
                                                            (stock.color || '').toLowerCase().includes('white') ? '#e2e8f0' :
                                                                (stock.color || '').toLowerCase().includes('black') ? '#1e293b' :
                                                                    (stock.color || '').toLowerCase().includes('red') ? '#ef4444' :
                                                                        (stock.color || '').toLowerCase().includes('blue') ? '#3b82f6' :
                                                                            (stock.color || '').toLowerCase().includes('silver') ? '#94a3b8' :
                                                                                (stock.color || '').toLowerCase().includes('grey') || (stock.color || '').toLowerCase().includes('gray') ? '#6b7280' :
                                                                                    (stock.color || '').toLowerCase().includes('green') ? '#22c55e' :
                                                                                        (stock.color || '').toLowerCase().includes('brown') ? '#92400e' :
                                                                                            (stock.color || '').toLowerCase().includes('gold') ? '#eab308' :
                                                                                                '#a78bfa'
                                                    }}></span>
                                                    {stock.color || '-'}
                                                </span>
                                            </td>
                                            <td className="td-center">{stock.seating || '-'}</td>
                                            <td className="td-center">{stock.emission || '-'}</td>
                                            <td>{stock.model_code || '-'}</td>
                                            <td className="td-mono">{stock.chassis_number || '-'}</td>
                                            <td className="td-mono">{stock.vin || '-'}</td>
                                            <td className="td-mono">{stock.engine_number || '-'}</td>
                                            <td className="td-center">
                                                <span className={`ss-age ${getAgeingClass(stock.ageing)}`}>
                                                    {stock.ageing || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ss-stype ${getStockTypeClass(stock.stock_type)}`}>
                                                    {stock.stock_type || '-'}
                                                </span>
                                            </td>
                                            <td>{stock.dealer_location_name || '-'}</td>
                                            <td>{stock.oem_invoice_number || '-'}</td>
                                            <td>{formatDate(stock.oem_invoice_date)}</td>
                                            <td>{stock.invoice_id || '-'}</td>
                                            <td>{formatDate(stock.invoice_date)}</td>
                                            <td>{stock.so_number || '-'}</td>
                                            <td>{stock.grn_no || '-'}</td>
                                            <td>{formatDate(stock.grn_date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="ss-pagination">
                            <span className="ss-pg-info">
                                {startIndex + 1}–{Math.min(endIndex, filteredStocks.length)} of <strong>{filteredStocks.length.toLocaleString()}</strong>
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
                    </>
                )}
            </div>

            {/* ═══ POPUP MODAL ═══ */}
            {showActionModal && selectedStock && (
                <div className="ss-overlay" onClick={closeActionModal}>
                    <div className="ss-popup" onClick={e => e.stopPropagation()}>
                        <div className="ss-popup-head">
                            <div className="ss-popup-title">
                                <span className="ss-popup-icon">🚗</span>
                                <div>
                                    <h4>{selectedStock.model_group || 'Vehicle'}</h4>
                                    <span className="ss-popup-sub">{selectedStock.variant_desc || '-'}</span>
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
                                <span className={`ss-stype ${getStockTypeClass(selectedStock.stock_type)}`}>{selectedStock.stock_type || '-'}</span>
                                <span className={`ss-age ${getAgeingClass(selectedStock.ageing)}`}>{selectedStock.ageing || 0}d</span>
                                <span className="ss-popup-tag">{selectedStock.color || '-'}</span>
                                <span className="ss-popup-tag">{selectedStock.seating || '-'} Seat</span>
                            </div>

                            <div className="ss-popup-grid">
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Chassis</span>
                                    <span className="ss-popup-val mono">{selectedStock.chassis_number || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">VIN</span>
                                    <span className="ss-popup-val mono">{selectedStock.vin || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Engine No</span>
                                    <span className="ss-popup-val mono">{selectedStock.engine_number || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Model Code</span>
                                    <span className="ss-popup-val">{selectedStock.model_code || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Model Year</span>
                                    <span className="ss-popup-val">{selectedStock.emission || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Location</span>
                                    <span className="ss-popup-val">{selectedStock.dealer_location_name || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">OEM Inv No</span>
                                    <span className="ss-popup-val">{selectedStock.oem_invoice_number || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">OEM Inv Date</span>
                                    <span className="ss-popup-val">{formatDate(selectedStock.oem_invoice_date)}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Invoice ID</span>
                                    <span className="ss-popup-val">{selectedStock.invoice_id || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">Invoice Date</span>
                                    <span className="ss-popup-val">{formatDate(selectedStock.invoice_date)}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">SO Number</span>
                                    <span className="ss-popup-val">{selectedStock.so_number || '-'}</span>
                                </div>
                                <div className="ss-popup-row">
                                    <span className="ss-popup-label">GRN</span>
                                    <span className="ss-popup-val">{selectedStock.grn_no || '-'} • {formatDate(selectedStock.grn_date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockStatus;