import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { sendOtp, verifyOtp, clearOtp, sendResetOtp, verifyResetOtp } from '../otpService';
import bcrypt from 'bcryptjs';
import './LoginPage.css';

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');

    // Signup state
    const [signupStep, setSignupStep] = useState(1);
    const [signupEmail, setSignupEmail] = useState('');
    const [signupOtp, setSignupOtp] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupCluster, setSignupCluster] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState('');
    const [signupError, setSignupError] = useState('');
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

    // Forgot password state
    const [resetStep, setResetStep] = useState(1);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetOtpSent, setResetOtpSent] = useState('');
    const [isSendingResetOtp, setIsSendingResetOtp] = useState(false);
    const [isVerifyingResetOtp, setIsVerifyingResetOtp] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetResendCooldown, setResetResendCooldown] = useState(0);
    const [isResendingReset, setIsResendingReset] = useState(false);
    const [showResetNewPassword, setShowResetNewPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

    const clusters = [
        "KASARGOD_MADB",
        "KANNUR",
        "CALICUT",
        "MALLAPURAM_MADB",
        "PALAKKAD - SR",
        "THRISSUR"
    ];

    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        if (resetResendCooldown > 0) {
            const timer = setTimeout(() => setResetResendCooldown(resetResendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resetResendCooldown]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        setLoginError('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        setLoginSuccess('');

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .ilike('username', credentials.username)
                .maybeSingle();

            if (error || !data) {
                setLoginError('Invalid username or password. Please try again.');
                setIsLoggingIn(false);
                return;
            }

            if (data.status === 'Inactive' || data.is_active === false) {
                setLoginError('Your account is inactive. Please contact the administrator.');
                setIsLoggingIn(false);
                return;
            }

            const isPasswordMatch = bcrypt.compareSync(credentials.password, data.password_hash);

            if (!isPasswordMatch) {
                setLoginError('Invalid username or password. Please try again.');
                setIsLoggingIn(false);
                return;
            }

            const userData = {
                id: data.id,
                username: data.username,
                email: data.email,
                full_name: data.full_name,
                role: data.role,
                cluster: data.cluster,
                status: data.status
            };

            localStorage.setItem('user', JSON.stringify(userData));

            let welcomeName = data.full_name || data.username || 'User';
            if (welcomeName.includes('@') && /\d/.test(welcomeName)) {
                welcomeName = data.username || 'User';
            }

            setLoginError('');
            setLoginSuccess(`Welcome back, ${welcomeName}! Redirecting...`);

            try {
                await supabase
                    .from('users')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', data.id);
            } catch (dbErr) {
                console.error('Non-critical error updating last login:', dbErr);
            }

            setTimeout(() => {
                navigate('/dashboard', { replace: true });
                setIsLoggingIn(false);
            }, 1200);

        } catch (err) {
            console.error('Login error:', err);
            setLoginError('Something went wrong. Please try again.');
            setLoginSuccess('');
            setIsLoggingIn(false);
        }
    };

    const validateEmailDomain = (email) => {
        if (!email.includes('@')) return false;
        return email.split('@')[1] === 'erammotors.com';
    };

    const validateUsername = (username) => {
        if (username.length < 3) return 'Username must be at least 3 characters';
        if (username.length > 20) return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9._]+$/.test(username)) return 'Username can only contain letters, numbers, dots and underscores';
        if (/^[._]/.test(username)) return 'Username cannot start with dot or underscore';
        return null;
    };

    const handleSendResetOtp = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetOtpSent('');

        if (!validateEmailDomain(resetEmail)) {
            setResetError('Only @erammotors.com emails are allowed');
            return;
        }

        setIsSendingResetOtp(true);

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', resetEmail)
                .eq('is_active', true)
                .maybeSingle();

            if (error || !user) {
                setResetError('No account found with this email address.');
                setIsSendingResetOtp(false);
                return;
            }

            await sendResetOtp(resetEmail);
            setResetOtpSent('Reset code sent to your email!');
            setResetStep(2);
            setResetResendCooldown(60);

        } catch (err) {
            setResetError('Failed to send reset code: ' + err.message);
        } finally {
            setIsSendingResetOtp(false);
        }
    };

    const handleVerifyResetOtp = async (e) => {
        e.preventDefault();
        setResetError('');

        if (resetOtp.length !== 6) {
            setResetError('Please enter a valid 6-digit code');
            return;
        }

        setIsVerifyingResetOtp(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const result = verifyResetOtp(resetEmail, resetOtp);

            if (!result.success) {
                setResetError(result.message);
                setIsVerifyingResetOtp(false);
                return;
            }

            setResetStep(3);

        } catch (err) {
            setResetError('Verification failed. Please try again.');
        } finally {
            setIsVerifyingResetOtp(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');

        if (resetNewPassword.length < 6) {
            setResetError('Password must be at least 6 characters');
            return;
        }

        if (resetNewPassword !== resetConfirmPassword) {
            setResetError('Passwords do not match');
            return;
        }

        setIsResettingPassword(true);

        try {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(resetNewPassword, salt);

            const { error } = await supabase
                .from('users')
                .update({
                    password_hash: hashedPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('email', resetEmail);

            if (error) {
                setResetError('Failed to update password: ' + error.message);
                setIsResettingPassword(false);
                return;
            }

            const { data: user } = await supabase
                .from('users')
                .select('username')
                .eq('email', resetEmail)
                .maybeSingle();

            setResetSuccess('Password updated successfully! Redirecting to login...');

            setTimeout(() => {
                setShowReset(false);
                setResetStep(1);
                setResetEmail('');
                setResetOtp('');
                setResetNewPassword('');
                setResetConfirmPassword('');
                setResetError('');
                setResetSuccess('');
                setResetOtpSent('');
                if (user) {
                    setCredentials({ username: user.username, password: resetNewPassword });
                }
            }, 3000);

        } catch (err) {
            setResetError('Something went wrong. Please try again.');
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleResendResetOtp = async () => {
        if (resetResendCooldown > 0 || isResendingReset) return;

        setIsResendingReset(true);
        setResetOtpSent('');
        setResetError('');
        setResetOtp('');

        try {
            clearOtp(resetEmail);
            await sendResetOtp(resetEmail);
            setResetOtpSent('New code sent successfully!');
            setResetResendCooldown(60);
        } catch (err) {
            setResetError('Failed to resend: ' + err.message);
        } finally {
            setIsResendingReset(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setEmailError('');
        setOtpSentMessage('');

        if (!validateEmailDomain(signupEmail)) {
            setEmailError('Only @erammotors.com email addresses are allowed');
            return;
        }

        setIsSendingOtp(true);

        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', signupEmail)
                .maybeSingle();

            if (existingUser) {
                setEmailError('This email is already registered. Please login instead.');
                setIsSendingOtp(false);
                return;
            }

            await sendOtp(signupEmail);
            setOtpSentMessage('6-digit OTP sent to your email!');
            setSignupStep(2);
            setResendCooldown(60);

        } catch (err) {
            setEmailError('Failed to send OTP: ' + err.message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpError('');

        if (signupOtp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsVerifyingOtp(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const result = verifyOtp(signupEmail, signupOtp);

            if (!result.success) {
                setOtpError(result.message);
                setIsVerifyingOtp(false);
                return;
            }

            const suggestedUsername = signupEmail.split('@')[0];
            setSignupUsername(suggestedUsername);
            setSignupStep(3);

        } catch (err) {
            setOtpError('Verification failed. Please try again.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSignupSave = async (e) => {
        e.preventDefault();
        setSignupSuccess('');
        setSignupError('');

        const finalUsername = signupUsername.trim();

        const usernameError = validateUsername(finalUsername);
        if (usernameError) {
            setSignupError(usernameError);
            return;
        }

        if (!signupName.trim()) {
            setSignupError('Please enter your full name');
            return;
        }

        if (signupPassword.length < 6) {
            setSignupError('Password must be at least 6 characters');
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            setSignupError('Passwords do not match');
            return;
        }

        if (!signupCluster) {
            setSignupError('Please select your cluster');
            return;
        }

        setIsSaving(true);

        try {
            const { data: existingUsername } = await supabase
                .from('users')
                .select('id')
                .ilike('username', finalUsername)
                .maybeSingle();

            if (existingUsername) {
                setSignupError('This username is already taken. Please choose another.');
                setIsSaving(false);
                return;
            }

            const { data: existingEmail } = await supabase
                .from('users')
                .select('id')
                .eq('email', signupEmail)
                .maybeSingle();

            if (existingEmail) {
                setSignupError('This email is already registered.');
                setIsSaving(false);
                return;
            }

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(signupPassword, salt);

            const { error } = await supabase
                .from('users')
                .insert([{
                    username: finalUsername,
                    email: signupEmail,
                    password_hash: hashedPassword,
                    full_name: signupName.trim(),
                    cluster: signupCluster,
                    status: 'Active',
                    phone: null,
                    role: 'user',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }])
                .select()
                .maybeSingle();

            if (error) {
                if (error.code === '23505') {
                    setSignupError('Username or email already exists. Please try different values.');
                } else {
                    setSignupError('Failed to create account: ' + error.message);
                }
                setIsSaving(false);
                return;
            }

            setSignupSuccess(`Account created successfully!\n\nYour username: ${finalUsername}\n\nRedirecting to login...`);

            setTimeout(() => {
                setShowSignup(false);
                setSignupStep(1);
                setSignupEmail('');
                setSignupOtp('');
                setSignupUsername('');
                setSignupName('');
                setSignupPassword('');
                setSignupConfirmPassword('');
                setSignupCluster('');
                setSignupSuccess('');
                setSignupError('');
                setOtpSentMessage('');

                setCredentials({ username: finalUsername, password: signupPassword });
            }, 4000);

        } catch (err) {
            console.error('Signup error:', err);
            setSignupError('Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || isResending) return;

        setIsResending(true);
        setOtpSentMessage('');
        setOtpError('');
        setSignupOtp('');

        try {
            clearOtp(signupEmail);
            await sendOtp(signupEmail);
            setOtpSentMessage('New OTP sent successfully!');
            setResendCooldown(60);
        } catch (err) {
            setOtpError('Failed to resend: ' + err.message);
        } finally {
            setIsResending(false);
        }
    };

    const goToLogin = () => {
        setShowSignup(false);
        setShowReset(false);
        setSignupStep(1);
        setSignupEmail('');
        setSignupOtp('');
        setSignupUsername('');
        setSignupName('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupCluster('');
        setEmailError('');
        setOtpError('');
        setSignupSuccess('');
        setSignupError('');
        setOtpSentMessage('');
        setLoginError('');
        setLoginSuccess('');
        setIsResending(false);
        setResetStep(1);
        setResetEmail('');
        setResetOtp('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setResetError('');
        setResetSuccess('');
        setResetOtpSent('');
    };

    if (isLoading) {
        return (
            <div className="splash">
                <div className="splash-bg">
                    <div className="splash-orb so1"></div>
                    <div className="splash-orb so2"></div>
                    <div className="splash-orb so3"></div>
                </div>
                <div className="splash-body">
                    <div className="splash-logo-wrap">
                        <div className="splash-ring"></div>
                        <img src="/Eram Logo.png" alt="Eram Motors" className="splash-logo-img" />
                    </div>
                    <h1 className="splash-h1">
                        <span>ERAM</span>
                        <span className="splash-red">MOTORS</span>
                    </h1>
                    <p className="splash-p">Stock Management Portal</p>
                    <div className="splash-bar-wrap"><div className="splash-bar"></div></div>
                    <div className="splash-dots"><i /><i /><i /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="lp">
            <div className="lp-bg">
                <div className="bg-base"></div>
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>
                <div className="bg-orb orb-3"></div>
                <div className="bg-orb orb-4"></div>
                <div className="bg-grid"></div>
                <div className="streak s1"></div>
                <div className="streak s2"></div>
                <div className="streak s3"></div>
                <div className="particles">
                    <i style={{ '--d': '12s', '--x': '10%' }} />
                    <i style={{ '--d': '18s', '--x': '25%' }} />
                    <i style={{ '--d': '15s', '--x': '40%' }} />
                    <i style={{ '--d': '20s', '--x': '55%' }} />
                    <i style={{ '--d': '14s', '--x': '70%' }} />
                    <i style={{ '--d': '16s', '--x': '85%' }} />
                    <i style={{ '--d': '22s', '--x': '15%' }} />
                    <i style={{ '--d': '19s', '--x': '60%' }} />
                    <i style={{ '--d': '17s', '--x': '90%' }} />
                    <i style={{ '--d': '13s', '--x': '35%' }} />
                </div>
            </div>

            <div className="lp-scroll">
                <div className="lp-inner">
                    <section className="lp-hero">
                        <div className="hero-body">
                            <span className="hero-badge"><i className="badge-dot" />STOCK MANAGEMENT SYSTEM</span>
                            <div className="hero-logo-block">
                                <img src="/Eram Logo.png" alt="Eram Motors" className="hero-logo" />
                                <div className="hero-logo-text">
                                    <h2>ERAM MOTORS</h2>
                                    <span>Authorized Mahindra Dealer</span>
                                </div>
                            </div>
                            <h1 className="hero-h1">Drive Your<br /><span className="hl">Inventory</span><br />Forward.</h1>
                            <p className="hero-p">Streamlined stock tracking and management platform for Eram Motors dealership network.</p>
                            <div className="hero-stats">
                                <div className="hs"><strong>1000+</strong><span>Vehicles</span></div>
                                <div className="hs-line" />
                                <div className="hs"><strong>12</strong><span>Showrooms</span></div>
                                <div className="hs-line" />
                                <div className="hs"><strong>99.9%</strong><span>Uptime</span></div>
                            </div>
                        </div>
                        <p className="hero-copy">© 2010 Eram Motors Pvt Ltd</p>
                    </section>

                    <section className="lp-card-area">
                        <div className="glass-card">
                            <div className="gc-corner gc-tl" />
                            <div className="gc-corner gc-br" />
                            <div className="gc-shine"></div>
                            <div className="card-logo-row">
                                <img src="/Eram Logo.png" alt="Eram Motors" className="card-logo" />
                                <span className="card-logo-title">ERAM MOTORS</span>
                            </div>

                            {/* ══ LOGIN ══ */}
                            {!showReset && !showSignup && (
                                <div className="view in">
                                    <header className="gc-head">
                                        <h2>Welcome Back</h2>
                                        <p>Enter your credentials to access your dashboard</p>
                                    </header>

                                    {loginSuccess && <div className="gc-alert gc-alert-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{loginSuccess}</div>}
                                    {loginError && !loginSuccess && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{loginError}</div>}

                                    <form onSubmit={handleLoginSubmit} className="gc-form">
                                        <div className={`fld ${focusedField === 'username' || credentials.username ? 'on' : ''}`}>
                                            <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>Username</label>
                                            <input type="text" name="username" value={credentials.username} onChange={handleChange} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} placeholder="Enter your username" autoComplete="username" required />
                                            <span className="fld-bar" />
                                        </div>

                                        <div className={`fld ${focusedField === 'password' || credentials.password ? 'on' : ''}`}>
                                            <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Password</label>
                                            <div className="pw-wrap">
                                                <input type={showPassword ? 'text' : 'password'} name="password" value={credentials.password} onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Enter your password" autoComplete="current-password" required />
                                                <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                                    {showPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>}
                                                </button>
                                            </div>
                                            <span className="fld-bar" />
                                        </div>

                                        <div className="form-meta">
                                            <label className="chk"><input type="checkbox" /><span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span>Remember me</label>
                                            <button type="button" className="txt-btn" onClick={() => { setShowReset(true); setShowSignup(false); setLoginError(''); setLoginSuccess(''); }}>Forgot Password?</button>
                                        </div>

                                        <button type="submit" className={`big-btn ${isLoggingIn ? 'busy' : ''}`} disabled={isLoggingIn}>
                                            <span className="bb-label">Sign In<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                                            <span className="bb-spin"><i /><i /><i /></span>
                                        </button>
                                    </form>

                                    <div className="signup-divider"><span className="divider-line"></span><span className="divider-text">OR</span><span className="divider-line"></span></div>

                                    <button type="button" className="signup-alt-btn" onClick={() => { setShowSignup(true); setShowReset(false); setLoginError(''); setLoginSuccess(''); }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                        Create New Account
                                    </button>

                                    <footer className="gc-foot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>256-bit SSL Encrypted</footer>
                                </div>
                            )}

                            {/* ══ FORGOT PASSWORD ══ */}
                            {showReset && !showSignup && (
                                <div className="view in">
                                    <button type="button" className="back-btn" onClick={goToLogin}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>Back to Login
                                    </button>

                                    <div className="reset-steps">
                                        <div className={`rs ${resetStep >= 1 ? (resetStep > 1 ? 'done' : 'active') : ''}`}><div className="rs-dot">{resetStep > 1 ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg> : '1'}</div><span>Email</span></div>
                                        <div className={`rs-line ${resetStep > 1 ? 'rs-line-active' : ''}`}></div>
                                        <div className={`rs ${resetStep >= 2 ? (resetStep > 2 ? 'done' : 'active') : ''}`}><div className="rs-dot">{resetStep > 2 ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg> : '2'}</div><span>Verify</span></div>
                                        <div className={`rs-line ${resetStep > 2 ? 'rs-line-active' : ''}`}></div>
                                        <div className={`rs ${resetStep >= 3 ? 'active' : ''}`}><div className="rs-dot">3</div><span>Reset</span></div>
                                    </div>

                                    {resetStep === 1 && (
                                        <>
                                            <header className="gc-head">
                                                <div className="reset-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" /></svg></div>
                                                <h2>Reset Password</h2>
                                                <p>Enter your registered email to receive a reset code</p>
                                            </header>
                                            {resetError && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{resetError}</div>}
                                            <form onSubmit={handleSendResetOtp} className="gc-form">
                                                <div className="fld on"><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>Email</label><input type="email" value={resetEmail} onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }} placeholder="name@erammotors.com" required /><span className="fld-bar" /></div>
                                                <button type="submit" className={`big-btn ${isSendingResetOtp ? 'busy' : ''}`} disabled={isSendingResetOtp}><span className="bb-label">Send Reset Code<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></span><span className="bb-spin"><i /><i /><i /></span></button>
                                            </form>
                                        </>
                                    )}

                                    {resetStep === 2 && (
                                        <>
                                            <header className="gc-head">
                                                <div className="reset-ico otp-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg></div>
                                                <h2>Verify Code</h2>
                                                <p>Enter the 6-digit code sent to</p>
                                                <div className="otp-email-badge">{resetEmail}</div>
                                            </header>
                                            {resetOtpSent && <div className="gc-alert gc-alert-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{resetOtpSent}</div>}
                                            {resetError && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{resetError}</div>}
                                            <form onSubmit={handleVerifyResetOtp} className="gc-form">
                                                <div className="fld on"><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Reset Code</label><input type="text" value={resetOtp} onChange={(e) => { setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setResetError(''); }} placeholder="000000" className="otp-input" maxLength={6} autoFocus required /><span className="fld-bar" /></div>
                                                <button type="submit" className={`big-btn ${isVerifyingResetOtp ? 'busy' : ''}`} disabled={isVerifyingResetOtp || resetOtp.length !== 6}><span className="bb-label">Verify Code<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></span><span className="bb-spin"><i /><i /><i /></span></button>
                                                <div className="resend-wrap">
                                                    <button type="button" className={`resend-link ${isResendingReset ? 'resend-loading' : ''}`} onClick={handleResendResetOtp} disabled={resetResendCooldown > 0 || isResendingReset}>
                                                        {isResendingReset ? (<><span className="resend-spinner"></span>Sending...</>) : resetResendCooldown > 0 ? (<>Resend in <strong>{resetResendCooldown}s</strong></>) : (<>Didn't receive? <strong>Resend Code</strong></>)}
                                                    </button>
                                                    <button type="button" className="change-email-link" onClick={() => { setResetStep(1); setResetOtp(''); setResetError(''); setResetOtpSent(''); }}>Change email</button>
                                                </div>
                                            </form>
                                        </>
                                    )}

                                    {resetStep === 3 && (
                                        <>
                                            <header className="gc-head">
                                                <div className="reset-ico profile-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
                                                <h2>New Password</h2>
                                                <p>Create a new password for your account</p>
                                            </header>
                                            <div className="gc-alert gc-alert-success" style={{ marginBottom: '20px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>Code verified!</div>
                                            {resetError && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{resetError}</div>}
                                            {resetSuccess && <div className="gc-alert gc-alert-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{resetSuccess}</div>}
                                            {!resetSuccess && (
                                                <form onSubmit={handleResetPassword} className="gc-form">
                                                    <div className="fld on"><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>New Password</label><div className="pw-wrap"><input type={showResetNewPassword ? 'text' : 'password'} value={resetNewPassword} onChange={(e) => { setResetNewPassword(e.target.value); setResetError(''); }} placeholder="Min 6 characters" required /><button type="button" className="eye" onClick={() => setShowResetNewPassword(!showResetNewPassword)} tabIndex={-1}>{showResetNewPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>}</button></div><span className="fld-bar" /></div>
                                                    <div className="fld on"><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>Confirm Password</label><div className="pw-wrap"><input type={showResetConfirmPassword ? 'text' : 'password'} value={resetConfirmPassword} onChange={(e) => { setResetConfirmPassword(e.target.value); setResetError(''); }} placeholder="Re-enter password" required /><button type="button" className="eye" onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)} tabIndex={-1}>{showResetConfirmPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>}</button></div><span className="fld-bar" /></div>
                                                    <button type="submit" className={`big-btn ${isResettingPassword ? 'busy' : ''}`} disabled={isResettingPassword}><span className="bb-label">Update Password<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></span><span className="bb-spin"><i /><i /><i /></span></button>
                                                </form>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ══ SIGNUP ══ */}
                            {showSignup && (
                                <div className="view in">
                                    <button type="button" className="back-btn" onClick={goToLogin}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>Back to Login
                                    </button>

                                    <div className="reset-steps">
                                        <div className={`rs ${signupStep >= 1 ? (signupStep > 1 ? 'done' : 'active') : ''}`}><div className="rs-dot">{signupStep > 1 ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg> : '1'}</div><span>Email</span></div>
                                        <div className={`rs-line ${signupStep > 1 ? 'rs-line-active' : ''}`}></div>
                                        <div className={`rs ${signupStep >= 2 ? (signupStep > 2 ? 'done' : 'active') : ''}`}><div className="rs-dot">{signupStep > 2 ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg> : '2'}</div><span>Verify</span></div>
                                        <div className={`rs-line ${signupStep > 2 ? 'rs-line-active' : ''}`}></div>
                                        <div className={`rs ${signupStep >= 3 ? 'active' : ''}`}><div className="rs-dot">3</div><span>Details</span></div>
                                    </div>

                                    {/* Step 1: Email */}
                                    {signupStep === 1 && (
                                        <>
                                            <header className="gc-head">
                                                <div className="reset-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                                                <h2>Create Account</h2>
                                                <p>Enter your @erammotors.com email to get started</p>
                                            </header>
                                            <form onSubmit={handleSendOtp} className="gc-form">
                                                <div className="fld on">
                                                    <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>Email Address</label>
                                                    <div className="email-otp-wrap">
                                                        <input type="email" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); setEmailError(''); }} placeholder="name@erammotors.com" className="email-otp-input" required />
                                                        <button type="submit" className={`otp-send-btn ${isSendingOtp ? 'otp-sending' : ''}`} disabled={isSendingOtp || !signupEmail}>
                                                            {isSendingOtp ? <span className="otp-btn-spinner"></span> : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>Send OTP</>}
                                                        </button>
                                                    </div>
                                                    <span className="fld-bar" />
                                                </div>
                                                {emailError && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{emailError}</div>}
                                            </form>
                                        </>
                                    )}

                                    {/* Step 2: OTP */}
                                    {signupStep === 2 && (
                                        <>
                                            <header className="gc-head">
                                                <div className="reset-ico otp-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg></div>
                                                <h2>Verify Email</h2>
                                                <p>Enter the 6-digit code sent to</p>
                                                <div className="otp-email-badge">{signupEmail}</div>
                                            </header>
                                            {otpSentMessage && <div className="gc-alert gc-alert-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>{otpSentMessage}</div>}
                                            <form onSubmit={handleVerifyOtp} className="gc-form">
                                                <div className="fld on"><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Verification Code</label><input type="text" value={signupOtp} onChange={(e) => { setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }} placeholder="000000" className="otp-input" maxLength={6} autoFocus required /><span className="fld-bar" /></div>
                                                {otpError && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{otpError}</div>}
                                                <button type="submit" className={`big-btn ${isVerifyingOtp ? 'busy' : ''}`} disabled={isVerifyingOtp || signupOtp.length !== 6}><span className="bb-label">Verify & Continue<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></span><span className="bb-spin"><i /><i /><i /></span></button>
                                                <div className="resend-wrap">
                                                    <button type="button" className={`resend-link ${isResending ? 'resend-loading' : ''}`} onClick={handleResendOtp} disabled={resendCooldown > 0 || isResending}>
                                                        {isResending ? (<><span className="resend-spinner"></span>Sending...</>) : resendCooldown > 0 ? (<>Resend OTP in <strong>{resendCooldown}s</strong></>) : (<>Didn't receive? <strong>Resend OTP</strong></>)}
                                                    </button>
                                                    <button type="button" className="change-email-link" onClick={() => { setSignupStep(1); setSignupOtp(''); setOtpError(''); setOtpSentMessage(''); clearOtp(signupEmail); }}>Change email</button>
                                                </div>
                                            </form>
                                        </>
                                    )}

                                    {/* Step 3: Profile */}
                                    {signupStep === 3 && (
                                        <>
                                            <header className="gc-head">
                                                <div className="reset-ico profile-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                                <h2>Complete Profile</h2>
                                                <p>Set your username, password and details</p>
                                            </header>
                                            <div className="gc-alert gc-alert-success" style={{ marginBottom: '16px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>Email verified successfully!</div>

                                            {signupError && !signupSuccess && <div className="gc-alert gc-alert-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{signupError}</div>}

                                            {signupSuccess && (
                                                <div className="gc-alert gc-alert-success signup-success-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg><div><strong>🎉 Account Created!</strong><p style={{ fontSize: '11px', marginTop: '6px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{signupSuccess}</p></div></div>
                                            )}

                                            {!signupSuccess && (
                                                <form onSubmit={handleSignupSave} className="gc-form">
                                                    <div className="fld on">
                                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>Email (Verified)</label>
                                                        <input type="email" value={signupEmail} disabled className="input-disabled" />
                                                        <span className="verified-badge-inline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>Verified</span>
                                                        <span className="fld-bar" />
                                                    </div>

                                                    <div className="fld on">
                                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>Username</label>
                                                        <input type="text" value={signupUsername} onChange={(e) => { setSignupUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, '')); setSignupError(''); }} placeholder="Choose a username" autoComplete="off" autoFocus required />
                                                        <span className="fld-bar" />
                                                        <p className="fld-hint">Letters, numbers, dots and underscores only. Min 3 characters.</p>
                                                    </div>

                                                    <div className="fld on">
                                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>Full Name</label>
                                                        <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Enter your full name" autoComplete="name" required />
                                                        <span className="fld-bar" />
                                                    </div>

                                                    <div className="fld on">
                                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Password</label>
                                                        <div className="pw-wrap">
                                                            <input type={showSignupPassword ? 'text' : 'password'} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" required />
                                                            <button type="button" className="eye" onClick={() => setShowSignupPassword(!showSignupPassword)} tabIndex={-1}>
                                                                {showSignupPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>}
                                                            </button>
                                                        </div>
                                                        <span className="fld-bar" />
                                                    </div>

                                                    <div className="fld on">
                                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>Confirm Password</label>
                                                        <div className="pw-wrap">
                                                            <input type={showSignupConfirmPassword ? 'text' : 'password'} value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" required />
                                                            <button type="button" className="eye" onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)} tabIndex={-1}>
                                                                {showSignupConfirmPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>}
                                                            </button>
                                                        </div>
                                                        <span className="fld-bar" />
                                                    </div>

                                                    <div className="fld on">
                                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>Cluster</label>
                                                        <div className="select-wrap">
                                                            <select value={signupCluster} onChange={(e) => setSignupCluster(e.target.value)} required className="fld-select">
                                                                <option value="" disabled>Select your cluster</option>
                                                                {clusters.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                            <svg className="sel-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                                                        </div>
                                                        <span className="fld-bar" />
                                                    </div>

                                                    <button type="submit" className={`big-btn ${isSaving ? 'busy' : ''}`} disabled={isSaving}>
                                                        <span className="bb-label">Create Account<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></span>
                                                        <span className="bb-spin"><i /><i /><i /></span>
                                                    </button>
                                                </form>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;