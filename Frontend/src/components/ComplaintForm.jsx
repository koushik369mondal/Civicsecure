import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  FaFileAlt,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaUpload,
  FaShieldAlt,
  FaInfoCircle,
  FaClock,
  FaTimes,
  FaEye,
  FaSearchLocation,
  FaGlobeAmericas
} from "react-icons/fa";

// Remove problematic imports and create inline components
// import AadhaarVerification from './AadhaarVerification';
// import SafeLocationPicker from './SafeLocationPicker';
// import { complaintAPI } from '../services/api';

// Mock API service [web:217][web:218]
const complaintAPI = {
  submitComplaint: async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      data: {
        complaintId: `CMP-${Date.now()}`,
        status: 'submitted',
        message: 'Complaint submitted successfully'
      }
    };
  }
};

// Simple Aadhaar Verification Component [web:217]
const AadhaarVerification = ({ mode = "simple", onVerificationComplete, isRequired = true }) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 12) {
      setAadhaarNumber(value);
      setError('');
      if (isVerified) {
        setIsVerified(false);
      }
    }
  };

  const handleVerification = async () => {
    if (aadhaarNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful verification
      const mockData = {
        name: 'John Doe',
        gender: 'Male',
        state: 'Maharashtra',
        district: 'Mumbai'
      };

      setIsVerified(true);
      onVerificationComplete?.({
        success: true,
        aadhaarNumber,
        data: mockData
      });

    } catch (err) {
      setError('Verification failed. Please try again.');
      onVerificationComplete?.({ success: false });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatAadhaar = (value) => {
    return value.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Aadhaar Verification
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {isVerified && (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="w-5 h-5 mr-2" />
            Verified ✓
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Number
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={isVerified ? `****-****-${aadhaarNumber.slice(-4)}` : formatAadhaar(aadhaarNumber)}
              onChange={handleAadhaarChange}
              placeholder="1234 5678 9012"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${isVerified
                  ? 'border-green-500 bg-green-50'
                  : error
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              disabled={isVerified || isVerifying}
              maxLength="14"
            />

            {!isVerified ? (
              <button
                type="button"
                onClick={handleVerification}
                disabled={isVerifying || aadhaarNumber.length !== 12}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center min-w-[100px]"
              >
                {isVerifying ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsVerified(false);
                  setAadhaarNumber('');
                  onVerificationComplete?.({ success: false });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Change
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-md">
            <FaExclamationTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isVerified && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Verification Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">John Doe</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Gender:</span>
                <span className="ml-2 text-gray-900">Male</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">State:</span>
                <span className="ml-2 text-gray-900">Maharashtra</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">District:</span>
                <span className="ml-2 text-gray-900">Mumbai</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>• Enter your 12-digit Aadhaar number without spaces</p>
          <p>• This is a demo verification system for testing purposes</p>
          <p>• Your data is secure and not stored permanently</p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Location Picker Component with Mapbox Integration [web:217][web:218][web:225]
const LocationPicker = ({ onLocationSelect, disabled = false }) => {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Get Mapbox access token from environment
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Initialize Mapbox map
  const initializeMap = useCallback((lat = 19.0760, lng = 72.8777) => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) return;

    // Load Mapbox GL JS dynamically
    if (!window.mapboxgl) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        createMap(lat, lng);
      };
      document.head.appendChild(script);
    } else {
      createMap(lat, lng);
    }
  }, [MAPBOX_TOKEN]);

  const createMap = (lat, lng) => {
    window.mapboxgl.accessToken = MAPBOX_TOKEN;
    
    mapRef.current = new window.mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 13
    });

    // Add navigation controls
    mapRef.current.addControl(new window.mapboxgl.NavigationControl());

    // Add click handler for map
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      updateLocation(lat, lng, `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    });

    // Add initial marker if coordinates exist
    if (coordinates.lat && coordinates.lng) {
      addMarker(coordinates.lat, coordinates.lng);
    }
  };

  const addMarker = (lat, lng) => {
    if (!mapRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    markerRef.current = new window.mapboxgl.Marker({
      color: '#10B981' // Emerald color
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
  };

  const updateLocation = async (lat, lng, addressText = null) => {
    setCoordinates({ lat, lng });
    
    let locationAddress = addressText;
    if (!addressText) {
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();
        locationAddress = data.features[0]?.place_name || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        locationAddress = `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }

    setAddress(locationAddress);
    addMarker(lat, lng);

    onLocationSelect?.({
      address: locationAddress,
      latitude: lat,
      longitude: lng,
      formatted: locationAddress
    });
  };

  // Mapbox geocoding function
  const mapboxGeocode = async (query) => {
    if (!MAPBOX_TOKEN) return [];

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=5`
      );
      const data = await response.json();

      return data.features?.map(feature => ({
        formatted: feature.place_name,
        latitude: feature.center[1],
        longitude: feature.center[0]
      })) || [];
    } catch (error) {
      console.error('Mapbox geocoding error:', error);
      return [];
    }
  };

  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 2) {
      setIsLoading(true);
      setShowSuggestions(true);

      try {
        const results = await mapboxGeocode(value);
        setSuggestions(results);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const { formatted, latitude, longitude } = suggestion;
    setAddress(formatted);
    setCoordinates({ lat: latitude, lng: longitude });
    setSuggestions([]);
    setShowSuggestions(false);

    // Update map if visible
    if (mapRef.current) {
      mapRef.current.setCenter([longitude, latitude]);
      addMarker(latitude, longitude);
    }

    onLocationSelect?.({
      address: formatted,
      latitude,
      longitude,
      formatted
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setUseCurrentLocation(true);
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateLocation(latitude, longitude);

        // Update map if visible
        if (mapRef.current) {
          mapRef.current.setCenter([longitude, latitude]);
        }

        setIsLoading(false);
        setUseCurrentLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your current location. Please enter address manually.');
        setIsLoading(false);
        setUseCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap && MAPBOX_TOKEN) {
      setTimeout(() => {
        initializeMap(coordinates.lat || 19.0760, coordinates.lng || 72.8777);
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Enter address or location"
              className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={disabled || isLoading}
            />

            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FaSpinner className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={disabled || isLoading || useCurrentLocation}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Use current location"
          >
            {useCurrentLocation ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSearchLocation />
            )}
          </button>

          {MAPBOX_TOKEN && (
            <button
              type="button"
              onClick={toggleMap}
              disabled={disabled}
              className={`px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                showMap 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Toggle map view"
            >
              <FaGlobeAmericas />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.formatted}
                    </p>
                    <p className="text-xs text-gray-500">
                      {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapbox Map Container */}
      {showMap && MAPBOX_TOKEN && (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <FaGlobeAmericas className="text-green-600" />
              Select Location on Map
            </h4>
            <button
              type="button"
              onClick={toggleMap}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close map"
            >
              <FaTimes />
            </button>
          </div>
          <div 
            ref={mapContainerRef} 
            className="h-80 w-full" 
            style={{ minHeight: '320px' }}
          />
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
            💡 Click anywhere on the map to select that location
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      {coordinates.lat && coordinates.lng && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <FaMapMarkerAlt className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Selected Location:
              </p>
              <p className="text-sm text-green-700">{address}</p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
            {MAPBOX_TOKEN && !showMap && (
              <button
                type="button"
                onClick={toggleMap}
                className="text-xs text-green-600 hover:text-green-800 transition-colors underline"
              >
                View on Map
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 space-y-1">
        <p>• Type an address and select from suggestions</p>
        <p>• Click the location button to use your current location</p>
        {MAPBOX_TOKEN && <p>• Use the map view to visually select a precise location</p>}
        <p>• Location data is required for complaint processing</p>
      </div>
    </div>
  );
};

// Form validation hook [web:194][web:196]
const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((field, value, formData = {}) => {
    let error = '';

    switch (field) {
      case 'title':
        if (!value.trim()) error = 'Title is required';
        else if (value.length < 5) error = 'Title must be at least 5 characters';
        else if (value.length > 100) error = 'Title must be less than 100 characters';
        break;

      case 'category':
        if (!value) error = 'Category is required';
        break;

      case 'description':
        if (!value.trim()) error = 'Description is required';
        else if (value.length < 10) error = 'Description must be at least 10 characters';
        else if (value.length > 1000) error = 'Description must be less than 1000 characters';
        break;

      case 'location':
        if (!value.trim() && !formData.coordinates) error = 'Location is required';
        break;

      case 'phone':
        if (formData.contactMethod === 'phone' || formData.contactMethod === 'both') {
          if (!value.trim()) error = 'Phone number is required';
          else if (!/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
            error = 'Enter a valid 10-digit mobile number';
          }
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

  return {
    errors,
    touched,
    validateField,
    setFieldTouched,
    clearError,
    clearAllErrors
  };
};

// Enhanced Form Field Component [web:194][web:198]
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
  disabled = false,
  helpText,
  as = "input",
  rows,
  options = [],
  children
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const Component = as;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="text-green-600" />}
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
          {helpText && (
            <div className="group relative">
              <FaInfoCircle className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {helpText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
      </label>

      <div className="relative">
        <Component
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${error && touched
              ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
              : isFocused
                ? 'border-green-500 focus:ring-green-200'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={error && touched ? 'true' : 'false'}
          aria-describedby={error && touched ? `${label}-error` : undefined}
        >
          {options.length > 0 ? (
            <>
              <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
              {options.map((option) => (
                <option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </>
          ) : children}
        </Component>

        {/* Success/Error Icons */}
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <FaExclamationTriangle className="text-red-500" />
            ) : value && (
              <FaCheckCircle className="text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && touched && (
        <div
          id={`${label}-error`}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
          role="alert"
        >
          <FaExclamationTriangle className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

// File Upload Component [web:194][web:202]
const FileUpload = ({
  files,
  onFilesChange,
  disabled,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    const totalFiles = [...files, ...validFiles];
    if (totalFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      onFilesChange([...files, ...validFiles].slice(0, maxFiles));
    } else {
      onFilesChange(totalFiles);
    }
  };

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${dragOver
            ? 'border-green-500 bg-green-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <FaUpload className={`mx-auto text-3xl mb-3 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
        <p className="text-sm font-medium text-gray-700 mb-1">
          {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-gray-500">
          Images, videos, PDF, DOC (max {maxSize / 1024 / 1024}MB each, {maxFiles} files max)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="text-green-600 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                disabled={disabled}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Success Component [web:202]
const SuccessMessage = ({ complaintId, onReset }) => (
  <div className="max-w-2xl mx-auto">
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <FaCheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complaint Submitted Successfully!
        </h2>
        <p className="text-gray-700 mb-4">
          Your complaint has been registered and assigned to the relevant department.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 mb-2">
            <strong>Complaint ID:</strong>
          </p>
          <p className="text-lg font-mono font-bold text-green-900">
            {complaintId}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <FaClock className="text-blue-600 mb-2" />
            <p className="font-medium text-blue-900 mb-1">Response Time</p>
            <p>We typically respond within 24-48 hours</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <FaEye className="text-purple-600 mb-2" />
            <p className="font-medium text-purple-900 mb-1">Track Status</p>
            <p>Use your complaint ID to track progress</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Submit Another Complaint
        </button>
      </div>
    </div>
  </div>
);

// Main ComplaintForm Component [web:194][web:196][web:200]
function ComplaintForm({ setCurrentPage }) {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: {
      address: "",
      latitude: null,
      longitude: null,
      formatted: ""
    },
    priority: "medium",
    reporterType: "anonymous",
    contactMethod: "email",
    phone: ""
  });

  // UI state
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  // Aadhaar verification state
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarData, setAadhaarData] = useState(null);

  // Form validation
  const { errors, touched, validateField, setFieldTouched, clearError, clearAllErrors } = useFormValidation();

  // Categories and priorities [web:199][web:202]
  const categories = [
    "Roads & Infrastructure",
    "Water Supply",
    "Electricity",
    "Sanitation & Waste",
    "Public Safety",
    "Traffic & Transportation",
    "Environment",
    "Health Services",
    "Plot Issue",
    "Plumbing",
    "Garbage",
    "Noise",
    "Other"
  ];

  const priorities = [
    { value: "low", label: "Low Priority", color: "text-green-600" },
    { value: "medium", label: "Medium Priority", color: "text-yellow-600" },
    { value: "high", label: "High Priority", color: "text-red-600" },
    { value: "urgent", label: "Urgent", color: "text-red-700" }
  ];

  const reporterTypes = [
    { value: "anonymous", label: "Anonymous Report" },
    { value: "pseudonymous", label: "Pseudonymous Report" },
    { value: "verified", label: "Verified Report (Aadhaar Required)" }
  ];

  const contactMethods = [
    { value: "email", label: "Email Only" },
    { value: "phone", label: "Phone Only" },
    { value: "both", label: "Both Email & Phone" }
  ];

  // Form validation check
  const isFormValid = useMemo(() => {
    const requiredFields = ['title', 'category', 'description'];
    const hasRequiredFields = requiredFields.every(field => formData[field].trim());
    const hasLocation = formData.location.formatted || formData.location.address;
    const hasValidPhone = formData.contactMethod !== 'phone' ||
      (formData.phone && /^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '')));
    const hasAadhaarIfNeeded = formData.reporterType !== 'verified' || aadhaarVerified;
    const hasNoErrors = Object.values(errors).every(error => !error);

    return hasRequiredFields && hasLocation && hasValidPhone && hasAadhaarIfNeeded && hasNoErrors;
  }, [formData, errors, aadhaarVerified]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    if (field === 'phone') {
      value = value.replace(/\D/g, ''); // Only digits
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field] && errors[field]) {
      clearError(field);
    }
  }, [touched, errors, clearError]);

  // Handle field blur
  const handleFieldBlur = useCallback((field, value) => {
    setFieldTouched(field);
    validateField(field, value, formData);
  }, [setFieldTouched, validateField, formData]);

  // Handle Aadhaar verification
  const handleAadhaarVerification = useCallback((result) => {
    setAadhaarVerified(result.success);
    setAadhaarData(result.data || null);
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback((locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
    clearError('location');
  }, [clearError]);

  // Handle form submission [web:194][web:196]
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearAllErrors();

    // Final validation
    const fieldValidations = Object.keys(formData).map(field =>
      validateField(field, formData[field], formData)
    );

    if (!fieldValidations.every(Boolean) || !isFormValid) {
      setIsSubmitting(false);
      return;
    }

    // Prepare complaint data
    const complaintData = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location: {
        address: formData.location.address || formData.location.formatted,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        formatted: formData.location.formatted || formData.location.address
      },
      priority: formData.priority,
      reporterType: formData.reporterType,
      contactMethod: formData.contactMethod,
      phone: formData.phone,
      aadhaarData: aadhaarVerified ? aadhaarData : null,
      attachments: attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await complaintAPI.submitComplaint(complaintData);

      setComplaintId(response.data.complaintId || `CMP-${Date.now()}`);
      setIsSuccess(true);

      console.log('✅ Complaint submitted successfully:', response);
    } catch (error) {
      console.error('❌ Error submitting complaint:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit complaint';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, attachments, aadhaarVerified, aadhaarData, isFormValid, validateField, clearAllErrors]);

  // Reset form
  const handleReset = useCallback(() => {
    setFormData({
      title: "",
      category: "",
      description: "",
      location: {
        address: "",
        latitude: null,
        longitude: null,
        formatted: ""
      },
      priority: "medium",
      reporterType: "anonymous",
      contactMethod: "email",
      phone: ""
    });
    setAttachments([]);
    setAadhaarVerified(false);
    setAadhaarData(null);
    setIsSuccess(false);
    setComplaintId('');
    clearAllErrors();
  }, [clearAllErrors]);

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <SuccessMessage
            complaintId={complaintId}
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">File a Complaint</h1>
            <p className="text-gray-700 text-base">Help us serve you better by reporting issues in your area</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2 font-medium transition-colors"
              onClick={() => setCurrentPage && setCurrentPage("dashboard")}
            >
              <FaEye />
              View Dashboard
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Aadhaar Verification Section */}
              {formData.reporterType === "verified" && (
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaShieldAlt className="text-green-600" />
                    Identity Verification
                  </h3>
                  <AadhaarVerification
                    mode="simple"
                    onVerificationComplete={handleAadhaarVerification}
                    isRequired={true}
                  />
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FormField
                  label="Complaint Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onBlur={(e) => handleFieldBlur('title', e.target.value)}
                  error={errors.title}
                  touched={touched.title}
                  placeholder="Brief description of the issue"
                  maxLength={100}
                  icon={FaFileAlt}
                  disabled={isSubmitting}
                  helpText="A clear, concise title for your complaint"
                />

                <FormField
                  label="Category"
                  as="select"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  onBlur={(e) => handleFieldBlur('category', e.target.value)}
                  error={errors.category}
                  touched={touched.category}
                  placeholder="Select a category"
                  options={categories}
                  disabled={isSubmitting}
                  helpText="Choose the category that best fits your complaint"
                />

                <FormField
                  label="Priority Level"
                  as="select"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  options={priorities}
                  disabled={isSubmitting}
                  required={false}
                  helpText="Select the urgency level of your complaint"
                />

                <FormField
                  label="Reporter Type"
                  as="select"
                  value={formData.reporterType}
                  onChange={(e) => handleInputChange('reporterType', e.target.value)}
                  options={reporterTypes}
                  disabled={isSubmitting}
                  helpText="Choose how you want to report this complaint"
                />
              </div>

              {/* Description */}
              <FormField
                label="Detailed Description"
                as="textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={(e) => handleFieldBlur('description', e.target.value)}
                error={errors.description}
                touched={touched.description}
                placeholder="Please provide detailed information about the issue..."
                maxLength={1000}
                rows={5}
                disabled={isSubmitting}
                helpText="Provide as much detail as possible to help us understand and resolve the issue"
              />

              {/* Location Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span>Location</span>
                    <span className="text-red-500 ml-1">*</span>
                    <div className="group relative">
                      <FaInfoCircle className="text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Select the exact location where the issue occurred
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </label>

                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  disabled={isSubmitting}
                />
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    label="Preferred Contact Method"
                    as="select"
                    value={formData.contactMethod}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    options={contactMethods}
                    disabled={isSubmitting}
                    icon={FaEnvelope}
                    required={false}
                    helpText="How would you like us to contact you about updates?"
                  />

                  {(formData.contactMethod === "phone" || formData.contactMethod === "both") && (
                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                      error={errors.phone}
                      touched={touched.phone}
                      placeholder="Enter your 10-digit phone number"
                      maxLength={10}
                      icon={FaPhone}
                      disabled={isSubmitting}
                    />
                  )}
                </div>
              </div>

              {/* File Attachments */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attachments <span className="text-sm font-normal text-gray-600">(Optional)</span>
                </h3>
                <FileUpload
                  files={attachments}
                  onFilesChange={setAttachments}
                  disabled={isSubmitting}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024}
                />
              </div>

              {/* Validation Messages */}
              <div className="space-y-4">
                {formData.reporterType === "verified" && !aadhaarVerified && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="w-5 h-5 text-orange-600 mr-2" />
                      <p className="text-sm text-orange-800">
                        Please complete Aadhaar verification to submit a verified complaint
                      </p>
                    </div>
                  </div>
                )}

                {(!formData.location.latitude && !formData.location.longitude) && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="w-5 h-5 text-orange-600 mr-2" />
                      <p className="text-sm text-orange-800">
                        Please select a location using the location picker above
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 min-w-48 ${isSubmitting || !isFormValid
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaFileAlt />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 border-l-4 border-l-blue-500">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Emergency Issues</p>
                <p className="text-gray-700">
                  For urgent matters requiring immediate attention, call our 24/7 emergency helpline:
                </p>
                <p className="font-mono text-lg text-green-600 font-bold">1800-XXX-XXXX</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Response Time</p>
                <p className="text-gray-700">We typically respond within:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Urgent: 2-4 hours</li>
                  <li>High: 12-24 hours</li>
                  <li>Medium/Low: 24-48 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm;
