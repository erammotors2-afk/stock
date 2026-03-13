import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserManagementPage from './pages/UserManagementPage';
import StockStatusPage from './pages/StockStatusPage';
import Sidebar from './pages/Sidebar';
import DeliveryPage from './pages/DeliveryPage';
import RetailReportPage from './pages/RetailReportPage';
import PreferencesPage from './pages/PreferencesPage';
import AccountPage from './pages/AccountPage';
import BillingPage from './pages/BillingPage';
import BookingListPage from './pages/BookingListPage';
import PBookingPage from './pages/PBookingPage';
import EmpDataPage from './pages/EmpDataPage';
import FtdRetailPage from './pages/FtdRetailPage';
import ShieldPage from './pages/ShieldPage';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const expiry = localStorage.getItem('loginExpiry');
    const isValid = !!(user && expiry && Date.now() < parseInt(expiry));
    if (!isValid && user) {
      // Session expired — wipe stale data
      localStorage.removeItem('user');
      localStorage.removeItem('loginExpiry');
    }
    setIsAuthenticated(isValid);
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121216',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36,
            height: 36,
            border: '3px solid rgba(211, 47, 47, 0.2)',
            borderTopColor: '#d32f2f',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto 14px'
          }} />
          <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/stock-status" element={
          <ProtectedRoute><StockStatusPage /></ProtectedRoute>
        } />

        <Route path="/user-management" element={
          <ProtectedRoute><UserManagementPage /></ProtectedRoute>
        } />

        <Route path="/delivery" element={
          <ProtectedRoute><DeliveryPage /></ProtectedRoute>
        } />

        <Route path="/retail-report" element={
          <ProtectedRoute><RetailReportPage /></ProtectedRoute>
        } />

        <Route path="/preferences" element={
          <ProtectedRoute><PreferencesPage /></ProtectedRoute>
        } />

        <Route path="/account" element={
          <ProtectedRoute><AccountPage /></ProtectedRoute>
        } />

        <Route path="/billing" element={
          <ProtectedRoute><BillingPage /></ProtectedRoute>
        } />

        <Route path="/booking-list" element={
          <ProtectedRoute><BookingListPage /></ProtectedRoute>
        } />

        <Route path="/p-booking" element={
          <ProtectedRoute><PBookingPage /></ProtectedRoute>
        } />

        <Route path="/emp-data" element={
          <ProtectedRoute><EmpDataPage /></ProtectedRoute>
        } />

        <Route path="/ftd-retail" element={
          <ProtectedRoute><FtdRetailPage /></ProtectedRoute>
        } />

        <Route path="/shield" element={
          <ProtectedRoute><ShieldPage /></ProtectedRoute>
        } />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;