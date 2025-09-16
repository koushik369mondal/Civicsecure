import React, { useState, useRef, useEffect } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  const otpInputs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    
    try {
      // API call to send OTP
      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` }),
      });

      if (response.ok) {
        setStep('otp');
        setTimer(30);
        setCanResend(false);
        // Focus on first OTP input
        setTimeout(() => {
          if (otpInputs.current[0]) {
            otpInputs.current[0].focus();
          }
        }, 100);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.match(/^\d$/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (index < 5 && value !== '') {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
    
    if (e.key === 'Backspace' && otp[index] !== '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedOtp = pastedData.slice(0, 6).split('');
    
    if (pastedOtp.every(char => char.match(/^\d$/))) {
      setOtp([...pastedOtp, ...Array(6 - pastedOtp.length).fill('')]);
      const lastIndex = Math.min(pastedOtp.length - 1, 5);
      otpInputs.current[lastIndex]?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // API call to verify OTP
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: `+91${phoneNumber}`,
          otp: otpString 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userPhone', phoneNumber);
        
        // Call success callback
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        otpInputs.current[0]?.focus();
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(30);
    setError('');
    
    try {
      await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` }),
      });
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setTimer(0);
    setCanResend(false);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className="card w-full max-w-md shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              CivicSecure
            </h1>
            <p className="text-gray-600">
              {step === 'phone' ? 'Enter your mobile number' : 'Verify OTP'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {step === 'phone' ? (
            /* Phone Number Form */
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Mobile Number</span>
                </label>
                <div className="input-group">
                  <span className="bg-gray-100 text-gray-700 font-medium px-4">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    className="input input-bordered w-full focus:border-green-500"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`btn btn-success w-full ${loading || phoneNumber.length < 10 ? 'btn-disabled' : ''}`}
                disabled={loading || phoneNumber.length < 10}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                We'll send a verification code to this number
              </div>
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {/* Phone Display */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-green-600"
                  onClick={goBackToPhone}
                >
                  ← Change
                </button>
                <span className="font-medium">+91 {phoneNumber}</span>
              </div>

              {/* OTP Inputs */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Enter 6-digit OTP</span>
                </label>
                <div className="flex justify-center gap-3 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputs.current[index] = el}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                      className="input input-bordered w-12 h-14 text-center text-xl font-bold focus:border-green-500"
                      maxLength="1"
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className={`btn btn-success w-full ${loading || otp.join('').length < 6 ? 'btn-disabled' : ''}`}
                disabled={loading || otp.join('').length < 6}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              {/* Resend Section */}
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-semibold text-green-600">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link text-green-600 p-0"
                    onClick={handleResendOtp}
                    disabled={!canResend}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
