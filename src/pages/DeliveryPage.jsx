import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import './DeliveryPage.css';

const DeliveryPage = ({ user, handleLogoutClick, darkMode, setDarkMode }) => {
    const [deliveries, setDeliveries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://api.erammotors.in/api/delivery');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDeliveries(data || []);
        } catch (error) {
            console.error('Error fetching deliveries from Cloudflare:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDeliveries = deliveries.filter(d =>
        d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dashboard
            user={user}
            handleLogoutClick={handleLogoutClick}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
        >
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
                                            <td>{d.invoice_date || '-'}</td>
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
        </Dashboard>
    );
};

export default DeliveryPage;
