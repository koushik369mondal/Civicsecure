import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LocationPicker from './LocationPicker';

const SafeLocationPicker = ({ onLocationSelect, disabled = false }) => {
  const [hasMapboxToken, setHasMapboxToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Mapbox token is available
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    setHasMapboxToken(!!token);
    setIsLoading(false);
  }, []);

  const handleFallbackLocationInput = (e) => {
    const address = e.target.value;
    if (address.trim()) {
      // Provide a basic location object for manual input
      onLocationSelect({
        address: address.trim(),
        latitude: null,
        longitude: null,
        formatted: address.trim()
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!hasMapboxToken) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 text-sm mb-3">
            ⚠️ Map service unavailable. Please enter your location manually.
          </p>
          <input
            type="text"
            placeholder="Enter your complaint location (e.g., Street Name, City)"
            onChange={handleFallbackLocationInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <LocationPicker onLocationSelect={onLocationSelect} disabled={disabled} />
    </ErrorBoundary>
  );
};

export default SafeLocationPicker;