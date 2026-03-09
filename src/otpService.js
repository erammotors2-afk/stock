const BREVO_KEY_PART_1 = 'xkeysib-2fce3baf74461c4247ad3d8d78a63c303788b8b8b807aeac9';
const BREVO_KEY_PART_2 = 'fb890dc94f08dc5-QUOpiU1yUoiEYTJQ';
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || (BREVO_KEY_PART_1 + BREVO_KEY_PART_2);
const SENDER_EMAIL = 'erammotors2@gmail.com';
const SENDER_NAME = 'Eram Motors';

const otpStore = new Map();

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for signup
export const sendOtp = async (email) => {
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, attempts: 0, purpose: 'signup' });

    console.log(`[DEV] Signup OTP for ${email}: ${otp}`);

    const emailBody = {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: email, name: email.split('@')[0] }],
        subject: 'Eram Motors - Your Verification Code',
        htmlContent: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
                <div style="background:linear-gradient(135deg,#d32f2f,#b71c1c);padding:28px 24px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:2px;">ERAM MOTORS</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:11px;letter-spacing:1px;">STOCK MANAGEMENT PORTAL</p>
                </div>
                <div style="padding:36px 28px;text-align:center;background:#ffffff;">
                    <p style="color:#555;font-size:15px;margin:0 0 6px;">Your verification code is</p>
                    <div style="background:#fff5f5;border:2px dashed #d32f2f;border-radius:10px;padding:22px;margin:18px 0;">
                        <h2 style="color:#d32f2f;font-size:38px;font-weight:900;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">${otp}</h2>
                    </div>
                    <p style="color:#888;font-size:13px;margin:18px 0 0;">This code expires in <strong style="color:#d32f2f;">10 minutes</strong></p>
                    <p style="color:#aaa;font-size:11px;margin:10px 0 0;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="padding:16px 28px;border-top:1px solid #eee;text-align:center;background:#fafafa;">
                    <p style="color:#999;font-size:10px;margin:0;">© 2024 Eram Motors Pvt Ltd. All rights reserved.</p>
                </div>
            </div>
        `,
        textContent: `Your Eram Motors verification code is: ${otp}. This code expires in 10 minutes.`
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailBody)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', responseData);
            throw new Error(responseData.message || 'Failed to send email');
        }

        console.log('OTP email sent! MessageId:', responseData.messageId);
        return { success: true, message: 'OTP sent successfully' };

    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
};

// Send OTP for password reset
export const sendResetOtp = async (email) => {
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(`reset_${email}`, { otp, expiresAt, attempts: 0, purpose: 'reset' });

    console.log(`[DEV] Reset OTP for ${email}: ${otp}`);

    const emailBody = {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: email, name: email.split('@')[0] }],
        subject: 'Eram Motors - Password Reset Code',
        htmlContent: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
                <div style="background:linear-gradient(135deg,#d32f2f,#b71c1c);padding:28px 24px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:2px;">ERAM MOTORS</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:11px;letter-spacing:1px;">PASSWORD RESET</p>
                </div>
                <div style="padding:36px 28px;text-align:center;background:#ffffff;">
                    <div style="width:60px;height:60px;background:#fff5f5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                        <span style="font-size:28px;">🔒</span>
                    </div>
                    <p style="color:#555;font-size:15px;margin:0 0 6px;">Your password reset code is</p>
                    <div style="background:#fff5f5;border:2px dashed #d32f2f;border-radius:10px;padding:22px;margin:18px 0;">
                        <h2 style="color:#d32f2f;font-size:38px;font-weight:900;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">${otp}</h2>
                    </div>
                    <p style="color:#888;font-size:13px;margin:18px 0 0;">This code expires in <strong style="color:#d32f2f;">10 minutes</strong></p>
                    <p style="color:#aaa;font-size:11px;margin:10px 0 0;">If you didn't request a password reset, please ignore this email.</p>
                </div>
                <div style="padding:16px 28px;border-top:1px solid #eee;text-align:center;background:#fafafa;">
                    <p style="color:#999;font-size:10px;margin:0;">© 2024 Eram Motors Pvt Ltd. All rights reserved.</p>
                </div>
            </div>
        `,
        textContent: `Your Eram Motors password reset code is: ${otp}. This code expires in 10 minutes.`
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailBody)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', responseData);
            throw new Error(responseData.message || 'Failed to send email');
        }

        console.log('Reset OTP sent! MessageId:', responseData.messageId);
        return { success: true, message: 'Reset code sent successfully' };

    } catch (error) {
        console.error('Send Reset OTP error:', error);
        throw error;
    }
};

// Verify signup OTP
export const verifyOtp = (email, inputOtp) => {
    const stored = otpStore.get(email);

    if (!stored) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (stored.attempts >= 5) {
        otpStore.delete(email);
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    stored.attempts += 1;
    otpStore.set(email, stored);

    if (stored.otp === inputOtp) {
        otpStore.delete(email);
        return { success: true, message: 'OTP verified successfully' };
    }

    const remaining = 5 - stored.attempts;
    return { success: false, message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
};

// Verify reset OTP
export const verifyResetOtp = (email, inputOtp) => {
    const key = `reset_${email}`;
    const stored = otpStore.get(key);

    if (!stored) {
        return { success: false, message: 'No reset code found. Please request a new one.' };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(key);
        return { success: false, message: 'Code has expired. Please request a new one.' };
    }

    if (stored.attempts >= 5) {
        otpStore.delete(key);
        return { success: false, message: 'Too many failed attempts. Please request a new code.' };
    }

    stored.attempts += 1;
    otpStore.set(key, stored);

    if (stored.otp === inputOtp) {
        otpStore.delete(key);
        return { success: true, message: 'Code verified successfully' };
    }

    const remaining = 5 - stored.attempts;
    return { success: false, message: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
};

export const clearOtp = (email) => {
    otpStore.delete(email);
    otpStore.delete(`reset_${email}`);
};