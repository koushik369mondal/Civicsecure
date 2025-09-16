import React, { useState, useEffect, useRef } from 'react';
import { FaIdCard, FaCheckCircle, FaExclamationTriangle, FaClock, FaSpinner, FaRedo, FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import { validateAadhaarNumber } from '../utils/verhoeff';
import {
  generateSecureOTP,
  validateOTP,
  validatePhoneNumber,
  maskPhoneNumber,
  formatTime,
  OTP_TIMER_DURATION,
  RESEND_COOLDOWN,
  isDev
} from '../utils/otp';
import Layout from './Layout';

const VERIFICATION_STORAGE_KEY = 'aadhaarVerification';
const VERIFICATION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

const AadhaarVerification = ({
  initialAadhaar = '',
  initialPhone = '',
  onVerificationComplete,
  onCancel,
  title = "Aadhaar Verification",
  showTitle = true
}) => {
  // Form state
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    aadhaarNumber: initialAadhaar,
    phoneNumber: initialPhone,
    otp: ''
  });

  // Image upload state
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // OTP management
  const [devOTP, setDevOTP] = useState('');
  const [otpTimer, setOtpTimer] = useState(OTP_TIMER_DURATION);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showOtpExpired, setShowOtpExpired] = useState(false);

  // Verification status
  const [verificationData, setVerificationData] = useState(null);

  // Refs for cleanup
  const otpIntervalRef = useRef(null);
  const resendIntervalRef = useRef(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Check for existing verification on mount
  useEffect(() => {
    checkExistingVerification();
  }, []);

  // Check if there's a valid existing verification
  const checkExistingVerification = () => {
    try {
      const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = new Date().getTime();
        const verificationTime = new Date(data.verificationTimestamp).getTime();

        if (now - verificationTime < VERIFICATION_DURATION) {
          setVerificationData(data);
          setStep('success');
          setFormData({
            aadhaarNumber: data.aadhaarVerified,
            phoneNumber: data.verifiedPhone,
            otp: ''
          });
        } else {
          // Verification expired, clear storage
          localStorage.removeItem(VERIFICATION_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking existing verification:', error);
      localStorage.removeItem(VERIFICATION_STORAGE_KEY);
    }
  };

  // Clear all errors
  const clearAllErrors = () => {
    setAadhaarError('');
    setPhoneError('');
    setOtpError('');
    setGeneralError('');
    setImageErrors({});
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    switch (field) {
      case 'aadhaarNumber':
        setAadhaarError('');
        break;
      case 'phoneNumber':
        setPhoneError('');
        break;
      case 'otp':
        setOtpError('');
        break;
    }
    setGeneralError('');
  };

  // Real-time Aadhaar validation on blur
  const validateAadhaarOnBlur = (aadhaarValue) => {
    if (aadhaarValue) {
      const validation = validateAadhaarNumber(aadhaarValue);
      if (!validation.isValid) {
        setAadhaarError('Invalid Aadhaar number. Please enter a valid 12-digit Aadhaar.');
      }
    }
  };

  // Handle image file selection
  const handleImageUpload = (file, type) => {
    // Clear previous errors
    setImageErrors(prev => ({ ...prev, [type]: '' }));

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageErrors(prev => ({ ...prev, [type]: 'Please select a valid image file (JPG, PNG)' }));
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageErrors(prev => ({ ...prev, [type]: 'File size must be less than 5MB' }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'front') {
        setFrontImage(file);
        // Revoke previous URL to prevent memory leaks
        if (frontPreview) URL.revokeObjectURL(frontPreview);
        setFrontPreview(e.target.result);
      } else {
        setBackImage(file);
        // Revoke previous URL to prevent memory leaks
        if (backPreview) URL.revokeObjectURL(backPreview);
        setBackPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = (type) => {
    if (type === 'front') {
      setFrontImage(null);
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPreview(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setBackImage(null);
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPreview(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
    setImageErrors(prev => ({ ...prev, [type]: '' }));
  };

  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(OTP_TIMER_DURATION);
    setShowOtpExpired(false);

    otpIntervalRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          setShowOtpExpired(true);
          clearInterval(otpIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start resend cooldown
  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);

    resendIntervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle form submission (send OTP)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAllErrors();

    try {
      // Validate Aadhaar
      const aadhaarValidation = validateAadhaarNumber(formData.aadhaarNumber);
      if (!aadhaarValidation.isValid) {
        setAadhaarError(aadhaarValidation.error);
        setLoading(false);
        return;
      }

      // Validate phone
      const phoneValidation = validatePhoneNumber(formData.phoneNumber);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error);
        setLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate OTP for development
      const otp = generateSecureOTP();
      setDevOTP(otp);

      // Move to OTP step
      setStep('otp');
      startOtpTimer();

      setLoading(false);
    } catch (error) {
      setGeneralError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAllErrors();

    try {
      // Validate OTP
      const otpValidation = validateOTP(formData.otp);
      if (!otpValidation.isValid) {
        setOtpError(otpValidation.error);
        setLoading(false);
        return;
      }

      // Check if OTP expired
      if (showOtpExpired) {
        setOtpError('OTP has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      // In development, verify against generated OTP
      if (isDev && formData.otp !== devOTP) {
        setOtpError('Invalid OTP. Please check and try again.');
        setLoading(false);
        return;
      }

      // Simulate API verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create verification data
      const verificationInfo = {
        aadhaarVerified: formData.aadhaarNumber,
        verifiedPhone: formData.phoneNumber,
        verificationTimestamp: new Date().toISOString()
      };

      // Store verification in localStorage for persistence
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verificationInfo));
      setVerificationData(verificationInfo);

      // Success - call parent callback with verification data
      if (onVerificationComplete) {
        onVerificationComplete(verificationInfo);
      }

      setStep('success');
      setLoading(false);
    } catch (error) {
      setGeneralError('OTP verification failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    clearAllErrors();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate new OTP
      const otp = generateSecureOTP();
      setDevOTP(otp);

      // Reset timers
      startOtpTimer();
      startResendCooldown();

      setLoading(false);
    } catch (error) {
      setGeneralError('Failed to resend OTP. Please try again.');
      setLoading(false);
    }
  };

  // Handle start over
  const handleStartOver = () => {
    setStep('form');
    setFormData({ aadhaarNumber: '', phoneNumber: '', otp: '' });
    clearAllErrors();
    setDevOTP('');
    setOtpTimer(OTP_TIMER_DURATION);
    setResendCooldown(0);
    setShowOtpExpired(false);
    setVerificationData(null);

    // Clear images
    removeImage('front');
    removeImage('back');

    // Clear timers
    if (otpIntervalRef.current) {
      clearInterval(otpIntervalRef.current);
      otpIntervalRef.current = null;
    }
    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }

    // Clear stored verification
    localStorage.removeItem(VERIFICATION_STORAGE_KEY);
  };

  // Handle verify different number
  const handleVerifyDifferent = () => {
    handleStartOver();
    if (onCancel) onCancel();
  };

  // Mask Aadhaar number for display (show only last 4 digits)
  const maskAadhaar = (aadhaarNumber) => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) return 'Not provided';
    const lastFour = aadhaarNumber.slice(-4);
    return `****-****-${lastFour}`;
  };

  // Check if form can be submitted
  const canSubmitForm = () => {
    const hasValidAadhaar = validateAadhaarNumber(formData.aadhaarNumber).isValid;
    const hasValidPhone = validatePhoneNumber(formData.phoneNumber).isValid;
    const hasImages = frontImage && backImage;
    const noImageErrors = Object.keys(imageErrors).length === 0 || Object.values(imageErrors).every(error => !error);

    return hasValidAadhaar && hasValidPhone && hasImages && noImageErrors;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        {showTitle && (
          <div className="flex items-center mb-6">
            <FaIdCard className="text-3xl text-emerald-600 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Verify Your Aadhaar
            </h2>
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Aadhaar Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  onBlur={(e) => validateAadhaarOnBlur(e.target.value)}
                  placeholder="Enter your 12-digit Aadhaar number"
                  className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${aadhaarError ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={12}
                  required
                />
                {aadhaarError && (
                  <p className="text-red-600 text-sm mt-1">{aadhaarError}</p>
                )}
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your 10-digit phone number"
                  className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={10}
                  required
                />
                {phoneError && (
                  <p className="text-red-600 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              {/* Image Upload - Front Side */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Front Side of Aadhaar Card
                </label>
                <div className="space-y-3">
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'front')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {imageErrors.front && (
                    <p className="text-red-600 text-sm">{imageErrors.front}</p>
                  )}
                  {frontPreview && (
                    <div className="relative inline-block">
                      <img
                        src={frontPreview}
                        alt="Front side preview"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('front')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload - Back Side */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Back Side of Aadhaar Card
                </label>
                <div className="space-y-3">
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'back')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {imageErrors.back && (
                    <p className="text-red-600 text-sm">{imageErrors.back}</p>
                  )}
                  {backPreview && (
                    <div className="relative inline-block">
                      <img
                        src={backPreview}
                        alt="Back side preview"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('back')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 mr-2" />
                  <span>{generalError}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading || !canSubmitForm()}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 inline-block" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Enter OTP</h2>
            <p className="text-gray-700 mb-4">
              OTP has been sent to {maskPhoneNumber(formData.phoneNumber)}
            </p>

            {/* Development OTP Display */}
            {isDev && devOTP && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <p className="text-blue-800 text-sm font-medium mb-1">
                  🔧 Development Mode
                </p>
                <p className="text-blue-700 text-lg font-mono">
                  OTP: <span className="font-bold">{devOTP}</span>
                </p>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${otpError ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={6}
                  required
                />
                {otpError && (
                  <p className="text-red-600 text-sm mt-1">{otpError}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-700">
                {otpTimer > 0 ? (
                  <span className="flex items-center gap-2">
                    <FaClock />
                    Expires in {formatTime(otpTimer)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-emerald-600 hover:text-emerald-700 font-medium underline"
                    disabled={resendCooldown > 0 || loading}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                )}
              </div>

              {showOtpExpired && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex items-center">
                  <FaClock className="h-5 w-5 mr-2" />
                  <span>OTP has expired. Please request a new one.</span>
                </div>
              )}

              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 mr-2" />
                  <span>{generalError}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading || showOtpExpired}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 inline-block" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-md transition-colors duration-200 flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Start Over
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-4">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-600 text-2xl mr-3" />
                <h2 className="text-xl font-bold text-green-800">
                  Aadhaar Successfully Verified
                </h2>
              </div>
            </div>

            {/* Verification Details Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Verification Details
              </h3>

              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-900 min-w-[120px] mb-1 sm:mb-0">
                    Aadhaar:
                  </span>
                  <span className="text-gray-900 font-mono text-lg">
                    {maskAadhaar(formData.aadhaarNumber)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-900 min-w-[120px] mb-1 sm:mb-0">
                    Phone:
                  </span>
                  <span className="text-gray-900 font-mono text-lg">
                    +91-{maskPhoneNumber(formData.phoneNumber)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-900 min-w-[120px] mb-1 sm:mb-0">
                    Verified on:
                  </span>
                  <span className="text-gray-900">
                    {new Date(verificationData?.verificationTimestamp).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              <p className="text-green-600 text-sm mt-4 italic font-medium flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Verification valid for 10 minutes
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleVerifyDifferent}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
                >
                  <FaRedo className="mr-2" />
                  Verify Different Number
                </button>

                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AadhaarVerification;
