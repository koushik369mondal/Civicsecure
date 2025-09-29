import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const Login = ({ onSwitchToRegister }) => {
    const [step, setStep] = useState('phone');
    const [formData, setFormData] = useState({
        phoneNumber: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [mockOTP, setMockOTP] = useState('');

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await authAPI.sendOTP('+91' + formData.phoneNumber);
            setMessage(response.data.message);
            // In development mode, the OTP will be shown in console
            console.log('Check console for OTP in development mode');
            setStep('otp');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.verifyOTP('+91' + formData.phoneNumber, formData.otp);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setMessage('Login successful! Redirecting...');

            // Redirect to main app or reload page
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-md shadow-2xl border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>

            {step === 'phone' && (
                <form className="space-y-6" onSubmit={handlePhoneSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Phone Number</label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.phoneNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, phoneNumber: value });
                            }}
                            placeholder="Enter your registered phone number"
                            maxLength="10"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                    >
                        {loading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                </form>
            )}

            {step === 'otp' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5 text-center">
                        <p className="text-lg font-semibold text-gray-700 mb-3">🔐 Prototype Mode</p>
                        <div className="text-2xl font-bold text-blue-600 font-mono tracking-widest mb-2">{mockOTP}</div>
                        <p className="text-sm text-gray-600">In production, this would be sent via SMS</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleOTPSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Verification Code</label>
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
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                        >
                            {loading ? 'Signing in...' : 'Complete Sign In'}
                        </button>
                    </form>
                </div>
            )}

            {message && (
                <div className={`mt-6 p-4 rounded-lg font-medium text-sm ${
                    message.includes('successful') 
                        ? 'bg-green-50 border-2 border-green-200 text-green-800' 
                        : 'bg-red-50 border-2 border-red-200 text-red-800'
                }`}>
                    {message}
                </div>
            )}

            <div className="text-center mt-6 text-gray-600">
                <p>Don't have an account? <button 
                    onClick={onSwitchToRegister}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors duration-200"
                >Create account</button></p>
            </div>
        </div>
    );
};

export default Login;
