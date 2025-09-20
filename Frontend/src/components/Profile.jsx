import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaCamera, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import Layout from "./Layout";

const PROFILE_STORAGE_KEY = 'userProfile';
const PROFILE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function Profile({ setCurrentPage }) {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Create a reference to the hidden file input
  const fileInputRef = useRef(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    checkAadhaarVerification();
  }, []);

  // Load profile data from localStorage
  const loadProfileData = () => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        const now = new Date().getTime();
        const profileTime = new Date(profileData.timestamp).getTime();

        // Check if profile data is still valid (within 10 minutes)
        if (now - profileTime < PROFILE_DURATION) {
          setUsername(profileData.username || '');
          setEmail(profileData.email || '');
          setPhone(profileData.phone || '');
          setAadhaar(profileData.aadhaar || '');
          setProfilePhoto(profileData.profilePhoto || null);
        } else {
          // Profile data expired, clear storage
          localStorage.removeItem(PROFILE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  };

  // Check Aadhaar verification status from AadhaarVerification component's storage
  const checkAadhaarVerification = () => {
    try {
      const storedVerification = localStorage.getItem('aadhaarVerification');
      if (storedVerification) {
        const verificationData = JSON.parse(storedVerification);
        const now = new Date().getTime();
        const verificationTime = new Date(verificationData.verificationTimestamp).getTime();

        // Check if verification is still valid (within 10 minutes)
        if (now - verificationTime < PROFILE_DURATION) {
          setAadhaarVerified(true);
          // Auto-fill Aadhaar if verified and not already filled
          if (!aadhaar && verificationData.aadhaarVerified) {
            setAadhaar(verificationData.aadhaarVerified);
          }
        } else {
          setAadhaarVerified(false);
        }
      }
    } catch (error) {
      console.error('Error checking Aadhaar verification:', error);
      setAadhaarVerified(false);
    }
  };

  // Save profile data to localStorage
  const saveProfileData = () => {
    const profileData = {
      username,
      email,
      phone,
      aadhaar,
      profilePhoto,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  };

  // Photo upload handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB' }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Please select a valid image file (JPG, PNG, GIF)' }));
        return;
      }

      // Clear photo errors
      setErrors(prev => ({ ...prev, photo: '' }));

      // Create preview URL for local display
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to trigger file input when photo area is clicked
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  // Remove photo
  const removePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
  };

  const validateAadhaar = (aadhaar) => {
    return /^\d{12}$/.test(aadhaar);
  };

  // Handle field blur for validation
  const handleFieldBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let error = '';
    switch (field) {
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (!validateUsername(value)) error = 'Username must be 3-20 characters long';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!validateEmail(value)) error = 'Please enter a valid email address';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!validatePhone(value)) error = 'Please enter a valid 10-digit phone number';
        break;
      case 'aadhaar':
        if (!value.trim()) error = 'Aadhaar number is required';
        else if (!validateAadhaar(value)) error = 'Please enter a valid 12-digit Aadhaar number';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Clear field errors on input change
  const handleFieldChange = (field, value) => {
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value.replace(/\D/g, ''));
        break;
      case 'aadhaar':
        setAadhaar(value.replace(/\D/g, ''));
        break;
    }

    if (touched[field] && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Function to navigate to Aadhaar verification page
  const handleAadhaarVerification = () => {
    if (setCurrentPage) {
      setCurrentPage("aadhaar-verify");
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      username.trim() &&
      validateUsername(username) &&
      email.trim() &&
      validateEmail(email) &&
      phone.trim() &&
      validatePhone(phone) &&
      aadhaar.trim() &&
      validateAadhaar(aadhaar) &&
      Object.values(errors).every(error => !error)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateSuccess(false);

    // Validate all fields
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    else if (!validateUsername(username)) newErrors.username = 'Username must be 3-20 characters long';

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';

    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid 10-digit phone number';

    if (!aadhaar.trim()) newErrors.aadhaar = 'Aadhaar number is required';
    else if (!validateAadhaar(aadhaar)) newErrors.aadhaar = 'Please enter a valid 12-digit Aadhaar number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save profile data with timestamp
      saveProfileData();

      setUpdateSuccess(true);
      setLoading(false);

      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <FaUser className="text-3xl text-emerald-600 mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            User Profile
          </h1>
        </div>

        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <FaCheckCircle className="h-5 w-5 mr-2" />
            <span>Profile updated successfully! Changes saved for 10 minutes.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              ref={fileInputRef}
              className="hidden"
            />

            {/* Clickable photo area */}
            <div className="relative group">
              <div
                onClick={handlePhotoClick}
                className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-4 border-emerald-200 shadow-lg cursor-pointer hover:border-emerald-400 hover:shadow-xl transition-all duration-200"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    <FaCamera className="text-2xl mb-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                  </div>
                )}
              </div>

              {/* Remove photo button */}
              {profilePhoto && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto();
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  ×
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-2 text-center">
              Click photo area to upload • JPG, PNG or GIF (max 5MB)
            </p>
            {errors.photo && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <FaExclamationTriangle className="mr-1" />
                {errors.photo}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                onBlur={(e) => handleFieldBlur('username', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your username"
                required
              />
              {errors.username && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaExclamationTriangle className="text-xs mr-1" />
                  {errors.username}
                </p>
              )}
              {username && !errors.username && touched.username && (
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <FaCheckCircle className="text-xs mr-1" />
                  Valid username
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={(e) => handleFieldBlur('email', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaExclamationTriangle className="text-xs mr-1" />
                  {errors.email}
                </p>
              )}
              {email && !errors.email && touched.email && (
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <FaCheckCircle className="text-xs mr-1" />
                  Valid email address
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
                required
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaExclamationTriangle className="text-xs mr-1" />
                  {errors.phone}
                </p>
              )}
              {phone && !errors.phone && touched.phone && (
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <FaCheckCircle className="text-xs mr-1" />
                  Valid phone number
                </p>
              )}
            </div>

            {/* Aadhaar Number with Verification Status */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => handleFieldChange('aadhaar', e.target.value)}
                onBlur={(e) => handleFieldBlur('aadhaar', e.target.value)}
                maxLength={12}
                className={`w-full px-4 py-3 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.aadhaar ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your 12-digit Aadhaar number"
                required
              />
              {errors.aadhaar && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaExclamationTriangle className="text-xs mr-1" />
                  {errors.aadhaar}
                </p>
              )}

              {/* Aadhaar Verification Status */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Status:</span>
                {aadhaarVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    <FaCheckCircle className="text-xs" />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAadhaarVerification}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 hover:text-orange-900 text-sm font-medium rounded-full cursor-pointer transition-colors duration-200"
                  >
                    <FaExclamationTriangle className="text-xs" />
                    Not Verified - Click to Verify
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-sm transition-all duration-200 min-w-48 ${loading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 inline-block" />
                  Updating Profile...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>

        {/* Profile Data Info */}
        {/* <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm text-center">
            ℹ️ Your profile data is automatically saved and will be retained for 10 minutes after each update.
          </p>
        </div> */}
      </div>
    </Layout>
  );
}
