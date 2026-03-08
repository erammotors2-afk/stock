import React, { useState } from 'react';
import './LogoutModal.css';

const LogoutModal = ({ show, onCancel, onConfirm }) => {
    const [loggingOut, setLoggingOut] = useState(false);

    if (!show) return null;

    const handleConfirm = () => {
        setLoggingOut(true);
        setTimeout(() => {
            onConfirm();
        }, 1000);
    };

    return (
        <div className="lo-overlay" onClick={!loggingOut ? onCancel : undefined}>
            <div className="lo-card" onClick={e => e.stopPropagation()}>

                <div className="lo-accent" />

                <div className="lo-emoji-wrap">
                    <span className="lo-emoji">👋</span>
                    <div className="lo-emoji-ring" />
                </div>

                <h3 className="lo-title">Leaving so soon?</h3>
                <p className="lo-desc">You'll need to sign in again to access your dashboard.</p>

                <div className="lo-btns">
                    <button
                        className="lo-btn lo-stay"
                        onClick={onCancel}
                        disabled={loggingOut}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Stay
                    </button>

                    <button
                        className={`lo-btn lo-go ${loggingOut ? 'lo-loading' : ''}`}
                        onClick={handleConfirm}
                        disabled={loggingOut}
                    >
                        {loggingOut ? (
                            <span className="lo-dots">
                                <i /><i /><i />
                            </span>
                        ) : (
                            <>
                                Logout
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;