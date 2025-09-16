import React, { useEffect, useMemo, useRef, useState } from 'react';
import { validateAadhaarNumber, verhoeffValidate, validTestNumbers } from '../../utils/verhoeff';
import { generateSecureOTP, validateOTP, validatePhoneNumber, formatTime, isDev } from '../../utils/otp';

// Register component with Aadhaar verification
const Register = ({ onSwitchToLogin }) => {
    const [step, setStep] = useState('details');
    const [formData, setFormData] = useState({
        aadhaarNumber: '',
        phoneNumber: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [devOTP, setDevOTP] = useState('');
    const [otpTimer, setOtpTimer] = useState(300); // total expiry 5 mins
    const [resendCooldown, setResendCooldown] = useState(60); // resend after 60s
    const resendIntervalRef = useRef(null);
    const otpIntervalRef = useRef(null);

    // Derived validation states
    const aadhaarValid = useMemo(() => /^\d{12}$/.test(formData.aadhaarNumber) && verhoeffValidate(formData.aadhaarNumber), [formData.aadhaarNumber]); // client pre-check [6]
    const phoneValid = useMemo(() => /^\d{10}$/.test(formData.phoneNumber), [formData.phoneNumber]); // basic numeric check [7]

    // Countdown for OTP expiry and resend cooldown
    useEffect(() => {
        if (step === 'otp') {
            // Start OTP timer
            if (otpTimer > 0 && !otpIntervalRef.current) {
                otpIntervalRef.current = setInterval(() => {
                    setOtpTimer((t) => (t > 0 ? t - 1 : 0));
                }, 1000);
            }

            // Start resend cooldown timer
            if (resendCooldown > 0 && !resendIntervalRef.current) {
                resendIntervalRef.current = setInterval(() => {
                    setResendCooldown((c) => {
                        if (c <= 1) {
                            clearInterval(resendIntervalRef.current);
                            resendIntervalRef.current = null;
                            return 0;
                        }
                        return c - 1;
                    });
                }, 1000);
            }
        }

        // Cleanup function
        return () => {
            if (otpIntervalRef.current) {
                clearInterval(otpIntervalRef.current);
                otpIntervalRef.current = null;
            }
            if (resendIntervalRef.current) {
                clearInterval(resendIntervalRef.current);
                resendIntervalRef.current = null;
            }
        };
    }, [step, otpTimer, resendCooldown]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Frontend validation before processing
        if (!aadhaarValid) {
            setLoading(false);
            setMessage('Please enter a valid 12-digit Aadhaar (checksum failed).');
            return;
        }
        if (!phoneValid) {
            setLoading(false);
            setMessage('Please enter a valid 10-digit phone number.');
            return;
        }

        try {
            // Generate client-side OTP for prototype
            const newOtp = generateSecureOTP();
            setDevOTP(newOtp);
            setStep('otp');
            setOtpTimer(300); // 5 minutes
            setResendCooldown(60); // 1 minute cooldown
            setMessage('Verification code generated. Check the development box below.');
        } catch (error) {
            setMessage('Failed to generate OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate OTP input
        if (!/^\d{6}$/.test(formData.otp)) {
            setLoading(false);
            setMessage('Please enter a 6-digit verification code.');
            return;
        }

        // Check if OTP has expired
        if (otpTimer === 0) {
            setLoading(false);
            setMessage('Invalid or expired OTP.');
            return;
        }

        // Verify OTP matches
        if (formData.otp !== devOTP) {
            setLoading(false);
            setMessage('Invalid or expired OTP.');
            return;
        }

        try {
            // Simulate successful registration
            const mockUser = {
                name: 'Test User',
                phoneNumber: formData.phoneNumber,
                aadhaarNumber: formData.aadhaarNumber,
                isVerified: true
            };
            const mockToken = 'mock-jwt-token-' + Date.now();

            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));

            setMessage('Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1200);
        } catch (error) {
            setMessage('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setMessage('');

        try {
            // Generate fresh OTP for prototype
            const newOtp = generateSecureOTP();
            setDevOTP(newOtp);
            setOtpTimer(300); // Reset to 5 minutes
            setResendCooldown(60); // Reset cooldown to 1 minute
            setMessage('New verification code generated.');
        } catch (error) {
            setMessage('Failed to generate new OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-md shadow-2xl border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
                Create Your Account
            </h2>

            {step === 'details' && (
                <form className="space-y-6" onSubmit={handleDetailsSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Aadhaar Number
                        </label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.aadhaarNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, aadhaarNumber: value });
                            }}
                            placeholder="Enter 12-digit Aadhaar number"
                            maxLength="12"
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-all duration-200 text-base ${formData.aadhaarNumber.length === 0
                                ? 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                                : aadhaarValid
                                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                    : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                }`}
                        />
                        {formData.aadhaarNumber.length === 12 && !aadhaarValid && (
                            <p className="text-xs text-red-600">
                                Invalid Aadhaar number. Please check the 12-digit number.
                            </p>
                        )}

                        {/* Development hint for test Aadhaar numbers - shown below error */}
                        {isDev && formData.aadhaarNumber.length === 12 && !aadhaarValid && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                                <h5 className="text-xs font-semibold text-blue-800 mb-1">🧪 Test Mode - Valid Sample Numbers:</h5>
                                <div className="grid grid-cols-1 gap-1 text-xs font-mono">
                                    {validTestNumbers.map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, aadhaarNumber: num })}
                                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-1 py-0.5 rounded transition-colors duration-150 text-left"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-blue-600 mt-1">These pass real Verhoeff validation</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.phoneNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, phoneNumber: value });
                            }}
                            placeholder="Enter 10-digit phone number"
                            maxLength="10"
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-all duration-200 text-base ${formData.phoneNumber.length === 0
                                ? 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                                : phoneValid
                                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                    : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                }`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                    >
                        {loading ? 'Processing...' : 'Send Verification Code'}
                    </button>
                </form>
            )}

            {step === 'otp' && (
                <div className="space-y-6">
                    {/* Dev-only OTP display */}
                    {isDev && devOTP && (
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5 text-center">
                            <p className="text-lg font-semibold text-gray-700 mb-3">🔐 Development Mode</p>
                            <div className="text-2xl font-bold text-blue-600 font-mono tracking-widest mb-2">
                                {devOTP}
                            </div>
                            <p className="text-sm text-gray-600">In production, this will be sent via SMS.</p>
                        </div>
                    )}

                    {/* Timers */}
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-600">
                            Expires in: <span className="font-mono font-bold text-red-600">{formatTime(otpTimer)}</span>
                        </p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || loading}
                            className={`text-blue-600 font-semibold underline disabled:text-gray-600 disabled:no-underline`}
                            title={resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend OTP'}
                        >
                            {resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend OTP'}
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleOTPSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Verification Code
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formData.otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, otp: value });
                                }}
                                placeholder="Enter 6-digit code"
                                maxLength="6"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            {loading ? 'Verifying...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            )}

            {message && (
                <div
                    className={`mt-6 p-4 rounded-lg font-medium text-sm ${/successful|sent|OTP/i.test(message)
                        ? 'bg-green-50 border-2 border-green-200 text-green-800'
                        : 'bg-red-50 border-2 border-red-200 text-red-800'
                        }`}
                >
                    {message}
                </div>
            )}

            {onSwitchToLogin && (
                <div className="text-center mt-6 text-gray-600">
                    <p>
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors duration-200"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Register;
