import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaUser,
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaEdit,
  FaSave,
  FaIdCard
} from 'react-icons/fa';

// Constants
const PROFILE_STORAGE_KEY = 'userProfile';
const AADHAAR_VERIFICATION_KEY = 'aadhaarVerification';
const PROFILE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

// Custom hooks for form validation [web:76][web:107]
const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((field, value) => {
    let error = '';

    switch (field) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.length < 3 || value.length > 20) {
          error = 'Username must be 3-20 characters long';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          error = 'Please enter a valid 10-digit phone number starting with 6-9';
        }
        break;

      case 'aadhaar':
        if (!value.trim()) {
          error = 'Aadhaar number is required';
        } else if (!/^\d{12}$/.test(value)) {
          error = 'Please enter a valid 12-digit Aadhaar number';
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  }, []);

  const setFieldTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const clearError = useCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const isFormValid = (formData) => {
    return Object.values(formData).every(value => value.trim() !== '') &&
      Object.values(errors).every(error => error === '');
  };

  return {
    errors,
    touched,
    validateField,
    setFieldTouched,
    clearError,
    clearAllErrors,
    isFormValid
  };
};

// Profile Photo Component [web:104][web:108]
const ProfilePhotoUpload = ({
  profilePhoto,
  onPhotoChange,
  onPhotoRemove,
  error,
  loading
}) => {
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onPhotoChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <input
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      <div className="relative group">
        <div
          onClick={handlePhotoClick}
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 overflow-hidden border-4 border-emerald-300 shadow-lg cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-emerald-600 hover:text-emerald-700 transition-colors duration-200">
              <FaCamera className="text-3xl mb-2" />
              <span className="text-sm font-medium">Add Photo</span>
            </div>
          )}
        </div>

        {profilePhoto && !loading && (
          <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm transition-colors"
              title="Change photo"
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPhotoRemove();
              }}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm transition-colors"
              title="Remove photo"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mt-3 text-center">
        Click to upload • JPG, PNG or GIF (max 5MB)
      </p>

      {error && (
        <p className="text-red-600 text-sm mt-2 flex items-center">
          <FaExclamationTriangle className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Form Field Component [web:104][web:107]
const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  maxLength,
  required = true,
  icon: Icon,
  disabled = false
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {Icon && <Icon className="inline mr-2 text-emerald-600" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
      />

      {error && touched && (
        <p className="text-red-600 text-sm mt-1 flex items-center">
          <FaExclamationTriangle className="text-xs mr-1" />
          {error}
        </p>
      )}

      {value && !error && touched && (
        <p className="text-green-600 text-sm mt-1 flex items-center">
          <FaCheckCircle className="text-xs mr-1" />
          Valid {label.toLowerCase()}
        </p>
      )}
    </div>
  );
};

// Aadhaar Verification Status Component [web:104][web:108]
const AadhaarVerificationStatus = ({
  isVerified,
  onVerificationClick,
  aadhaarNumber
}) => {
  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          <FaIdCard className="inline mr-2 text-emerald-600" />
          Verification Status:
        </span>

        {isVerified ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <FaCheckCircle className="text-xs" />
              Verified
            </span>
            <span className="text-xs text-gray-500">
              Aadhaar: ****-****-{aadhaarNumber.slice(-4)}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onVerificationClick}
            className="inline-flex items-center gap-1 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 hover:text-orange-900 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
          >
            <FaExclamationTriangle className="text-xs" />
            Click to Verify Aadhaar
          </button>
        )}
      </div>

      {!isVerified && (
        <p className="text-xs text-gray-600 mt-2">
          Verify your Aadhaar to complete your profile setup
        </p>
      )}
    </div>
  );
};

// Main Profile Component [web:104][web:108][web:109]
export default function Profile({ setCurrentPage }) {
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    aadhaar: ""
  });

  // UI state
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Custom hooks
  const {
    errors,
    touched,
    validateField,
    setFieldTouched,
    clearError,
    clearAllErrors,
    isFormValid
  } = useFormValidation();

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
    checkAadhaarVerification();
  }, []);

  // Load profile data from localStorage [web:104]
  const loadProfileData = useCallback(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        const now = Date.now();
        const profileTime = new Date(profileData.timestamp).getTime();

        if (now - profileTime < PROFILE_DURATION) {
          setFormData({
            username: profileData.username || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            aadhaar: profileData.aadhaar || ''
          });
          setProfilePhoto(profileData.profilePhoto || null);
        } else {
          localStorage.removeItem(PROFILE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  // Check Aadhaar verification status [web:104]
  const checkAadhaarVerification = useCallback(() => {
    try {
      const storedVerification = localStorage.getItem(AADHAAR_VERIFICATION_KEY);
      if (storedVerification) {
        const verificationData = JSON.parse(storedVerification);
        const now = Date.now();
        const verificationTime = new Date(verificationData.verificationTimestamp).getTime();

        if (now - verificationTime < PROFILE_DURATION) {
          setAadhaarVerified(true);
          if (!formData.aadhaar && verificationData.aadhaarVerified) {
            setFormData(prev => ({
              ...prev,
              aadhaar: verificationData.aadhaarVerified
            }));
          }
        } else {
          setAadhaarVerified(false);
        }
      }
    } catch (error) {
      console.error('Error checking Aadhaar verification:', error);
      setAadhaarVerified(false);
    }
  }, [formData.aadhaar]);

  // Save profile data to localStorage [web:104]
  const saveProfileData = useCallback(() => {
    const profileData = {
      ...formData,
      profilePhoto,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  }, [formData, profilePhoto]);

  // Photo upload handler [web:104]
  const handlePhotoChange = useCallback((file) => {
    setPhotoError('');

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError('Please select a valid image file (JPG, PNG, GIF)');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhoto(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove photo handler
  const handlePhotoRemove = useCallback(() => {
    setProfilePhoto(null);
    setPhotoError('');
  }, []);

  // Field change handlers [web:76][web:107]
  const handleFieldChange = useCallback((field, value) => {
    let processedValue = value;

    // Process specific fields
    if (field === 'phone' || field === 'aadhaar') {
      processedValue = value.replace(/\D/g, ''); // Only digits
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // Clear error if field is touched
    if (touched[field] && errors[field]) {
      clearError(field);
    }
  }, [touched, errors, clearError]);

  // Field blur handler [web:76][web:107]
  const handleFieldBlur = useCallback((field, value) => {
    setFieldTouched(field);
    validateField(field, value);
  }, [setFieldTouched, validateField]);

  // Navigate to Aadhaar verification
  const handleAadhaarVerification = useCallback(() => {
    if (setCurrentPage) {
      setCurrentPage("aadhaar-verify");
    }
  }, [setCurrentPage]);

  // Form submission handler [web:76][web:107]
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateSuccess(false);
    clearAllErrors();

    // Validate all fields
    const fieldValidations = Object.entries(formData).map(([field, value]) =>
      validateField(field, value)
    );

    if (!fieldValidations.every(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save profile data
      saveProfileData();

      setUpdateSuccess(true);

      // Auto-hide success message
      setTimeout(() => setUpdateSuccess(false), 4000);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, validateField, clearAllErrors, saveProfileData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Gradient Background */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center text-white">
            <FaUser className="text-4xl mr-4" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                User Profile
              </h1>
              <p className="text-lg text-emerald-100">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg flex items-center shadow-sm">
            <FaCheckCircle className="h-6 w-6 mr-3 text-green-600" />
            <div>
              <p className="font-medium">Profile updated successfully!</p>
              <p className="text-sm text-green-700">Changes saved for 10 minutes</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo Section */}
            <ProfilePhotoUpload
              profilePhoto={profilePhoto}
              onPhotoChange={handlePhotoChange}
              onPhotoRemove={handlePhotoRemove}
              error={photoError}
              loading={loading}
            />

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Username"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                onBlur={(e) => handleFieldBlur('username', e.target.value)}
                error={errors.username}
                touched={touched.username}
                placeholder="Enter your username"
                maxLength={20}
                icon={FaUser}
                disabled={loading}
              />

              <FormField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={(e) => handleFieldBlur('email', e.target.value)}
                error={errors.email}
                touched={touched.email}
                placeholder="Enter your email address"
                disabled={loading}
              />

              <FormField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                error={errors.phone}
                touched={touched.phone}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
                disabled={loading}
              />

              <div>
                <FormField
                  label="Aadhaar Number"
                  type="text"
                  value={formData.aadhaar}
                  onChange={(e) => handleFieldChange('aadhaar', e.target.value)}
                  onBlur={(e) => handleFieldBlur('aadhaar', e.target.value)}
                  error={errors.aadhaar}
                  touched={touched.aadhaar}
                  placeholder="Enter your 12-digit Aadhaar number"
                  maxLength={12}
                  icon={FaIdCard}
                  disabled={loading}
                />

                <AadhaarVerificationStatus
                  isVerified={aadhaarVerified}
                  onVerificationClick={handleAadhaarVerification}
                  aadhaarNumber={formData.aadhaar}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading || !isFormValid(formData)}
                className={`px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 min-w-60 ${loading || !isFormValid(formData)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:-translate-y-1 hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-3 inline-block" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-3 inline-block" />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">ℹ️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Data Retention Policy
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Your profile data is automatically saved and retained for 10 minutes after each update</p>
                <p>• For enhanced security, complete Aadhaar verification</p>
                <p>• All data is stored securely in your browser's local storage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
