import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { supabase } from '../config/supabaseClient';
import bcrypt from 'bcryptjs';

const UserManagement = () => {
    const [usersList, setUsersList] = useState([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);

    // Add User Modal States
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [userFormError, setUserFormError] = useState('');
    const [userFormSuccess, setUserFormSuccess] = useState('');
    const [newUser, setNewUser] = useState({
        username: '', full_name: '', email: '', password: '', role: 'user', cluster: ''
    });

    // Cute Confirmation Modal State
    const [statusConfirm, setStatusConfirm] = useState({ show: false, user: null });

    const clusters = ["KASARGOD_MADB", "KANNUR", "CALICUT", "MALLAPURAM_MADB", "PALAKKAD - SR", "THRISSUR"];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsFetchingUsers(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, full_name, email, role, cluster, status, created_at')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setUsersList(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setIsFetchingUsers(false);
        }
    };

    // 1. Opens the cute confirmation modal
    const initiateToggleStatus = (user) => {
        setStatusConfirm({ show: true, user });
    };

    // 2. Actually executes the database update when confirmed
    const confirmToggleStatus = async () => {
        const { user } = statusConfirm;
        if (!user) return;

        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        const newIsActive = newStatus === 'Active';

        try {
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus, is_active: newIsActive, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (!error) {
                setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                // Close the cute modal
                setStatusConfirm({ show: false, user: null });
            } else {
                alert('Failed to update user status.');
            }
        } catch (err) {
            console.error("Status update error:", err);
        }
    };

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        setUserFormError('');
        setUserFormSuccess('');
        setIsAddingUser(true);

        try {
            if (newUser.username.length < 3) throw new Error("Username must be at least 3 characters.");
            if (newUser.password.length < 6) throw new Error("Password must be at least 6 characters.");
            if (!newUser.cluster) throw new Error("Please select a cluster.");

            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .or(`username.ilike.${newUser.username.trim()},email.eq.${newUser.email.trim()}`)
                .maybeSingle();

            if (existing) throw new Error("Username or Email already exists.");

            // Secure Hash Password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(newUser.password, salt);

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    username: newUser.username.trim(),
                    full_name: newUser.full_name.trim(),
                    email: newUser.email.trim(),
                    password_hash: hashedPassword,
                    role: newUser.role,
                    cluster: newUser.cluster,
                    status: 'Active',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select('id, username, full_name, email, role, cluster, status, created_at')
                .single();

            if (error) throw error;

            setUsersList([data, ...usersList]);
            setUserFormSuccess("User successfully created!");

            setTimeout(() => {
                setShowAddUserModal(false);
                setUserFormSuccess('');
                setNewUser({ username: '', full_name: '', email: '', password: '', role: 'user', cluster: '' });
            }, 2000);

        } catch (err) {
            setUserFormError(err.message || 'Failed to create user.');
        } finally {
            setIsAddingUser(false);
        }
    };


    return (
        <div className="um-container">
            <div className="um-toolbar">
                <button className="db-btn db-btn-primary" onClick={() => setShowAddUserModal(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add New User
                </button>
            </div>

            <div className="card table-card">
                <div className="table-wrap user-table-wrap">
                    {isFetchingUsers ? (
                        <div className="um-loading">
                            <div className="um-spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name & Email</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Cluster</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="v-cell">
                                                <div className="um-avatar">{(u.full_name || 'U').charAt(0).toUpperCase()}</div>
                                                <div className="um-name-col">
                                                    <strong>{u.full_name}</strong>
                                                    <span>{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{u.username}</td>
                                        <td><span className={`um-role-tag rb-${u.role}`}>{u.role}</span></td>
                                        <td>{u.cluster}</td>
                                        <td>
                                            <span className={`um-status badge-${u.status?.toLowerCase() || 'active'}`}>
                                                {u.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`um-action-btn ${u.status === 'Inactive' ? 'btn-make-active' : 'btn-make-inactive'}`}
                                                onClick={() => initiateToggleStatus(u)}
                                            >
                                                {u.status === 'Inactive' ? 'Make Active' : 'Mark Inactive'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* --- ADD USER MODAL --- */}
            {showAddUserModal && (
                <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal-card wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <h3>Create New User</h3>
                            <p>Add a new employee to the Eram Motors portal.</p>
                        </div>

                        {userFormError && <div className="modal-alert error">{userFormError}</div>}
                        {userFormSuccess && <div className="modal-alert success">{userFormSuccess}</div>}

                        <form className="modal-form" onSubmit={handleAddUserSubmit}>
                            <div className="form-grid">
                                <div className="modal-fld">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="John Doe" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} required />
                                </div>
                                <div className="modal-fld">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="john@erammotors.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                </div>
                                <div className="modal-fld">
                                    <label>Username</label>
                                    <input type="text" placeholder="johndoe" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value.replace(/[^a-zA-Z0-9._]/g, '') })} required />
                                </div>
                                <div className="modal-fld">
                                    <label>Password</label>
                                    <input type="text" placeholder="Min 6 characters" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                </div>
                                <div className="modal-fld">
                                    <label>Role</label>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} required>
                                        <option value="user">User</option>
                                        <option value="head">Head</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-fld">
                                    <label>Cluster</label>
                                    <select value={newUser.cluster} onChange={e => setNewUser({ ...newUser, cluster: e.target.value })} required>
                                        <option value="" disabled>Select Cluster</option>
                                        {clusters.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="modal-btn cancel" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                                <button type="submit" className={`modal-btn confirm ${isAddingUser ? 'busy' : ''}`} disabled={isAddingUser}>
                                    {isAddingUser ? 'Saving...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- CUTE STATUS CONFIRMATION MODAL --- */}
            {statusConfirm.show && statusConfirm.user && (
                <div className="modal-overlay cute-modal-overlay" onClick={() => setStatusConfirm({ show: false, user: null })}>
                    <div className="modal-card cute-modal" onClick={e => e.stopPropagation()}>
                        <div className="cute-icon">
                            {statusConfirm.user.status === 'Active' ? '🥺' : '🥳'}
                        </div>
                        <h3>
                            {statusConfirm.user.status === 'Active' ? 'Wait a second!' : 'Yay! Welcome back!'}
                        </h3>
                        <p>
                            {statusConfirm.user.status === 'Active'
                                ? `Are you absolutely sure you want to deactivate ${statusConfirm.user.full_name || statusConfirm.user.username}? They will lose access to the portal!`
                                : `Do you want to reactivate ${statusConfirm.user.full_name || statusConfirm.user.username} so they can access the portal again?`}
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setStatusConfirm({ show: false, user: null })}>
                                Nevermind
                            </button>
                            <button
                                className={`modal-btn confirm ${statusConfirm.user.status === 'Active' ? 'cute-danger-btn' : 'cute-success-btn'}`}
                                onClick={confirmToggleStatus}
                            >
                                {statusConfirm.user.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Reactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;