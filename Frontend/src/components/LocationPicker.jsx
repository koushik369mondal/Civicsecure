import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Custom marker component
const CustomMarker = ({ longitude, latitude, color = "#ef4444" }) => (
    <div
        style={{
            background: color,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer'
        }}
    />
);

function LocationPicker({ onLocationSelect, disabled = false }) {
    const mapRef = useRef(null);
    const [viewState, setViewState] = useState({
        longitude: 77.5946, // Bangalore longitude
        latitude: 12.9716,  // Bangalore latitude
        zoom: 12
    });

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [locationInfo, setLocationInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Search functionality state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Fix: Use import.meta.env instead of process.env for Vite
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    // Get current location on component mount
    useEffect(() => {
        if (navigator.geolocation && !disabled) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const current = {
                        longitude: position.coords.longitude,
                        latitude: position.coords.latitude
                    };
                    setCurrentLocation(current);

                    // Optionally center map on current location
                    setViewState(prev => ({
                        ...prev,
                        longitude: current.longitude,
                        latitude: current.latitude,
                        zoom: 14
                    }));
                },
                (error) => {
                    console.warn('Could not get current location:', error);
                }
            );
        }
    }, [disabled]);

    // Handle map click to select location
    const handleMapClick = useCallback(async (event) => {
        if (disabled) return;

        const { lngLat } = event;
        const longitude = lngLat.lng;
        const latitude = lngLat.lat;

        setSelectedLocation({ longitude, latitude });
        setShowPopup(true);
        setLoading(true);
        setError('');

        // Reverse geocoding to get address
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }

            const data = await response.json();

            let address = 'Unknown location';
            if (data.features && data.features.length > 0) {
                address = data.features[0].place_name;
            }

            setLocationInfo(address);

            // Send location data to parent
            const locationData = {
                address: address,
                latitude: latitude,
                longitude: longitude,
                formatted: address
            };

            onLocationSelect(locationData);

        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Could not fetch address for this location');

            // Still provide coordinates
            const locationData = {
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                latitude: latitude,
                longitude: longitude,
                formatted: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };

            onLocationSelect(locationData);
        } finally {
            setLoading(false);
        }
    }, [disabled, onLocationSelect, MAPBOX_TOKEN]);

    // Use current location as selected location
    const useCurrentLocation = async () => {
        if (!navigator.geolocation || disabled) return;

        setLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const longitude = position.coords.longitude;
                const latitude = position.coords.latitude;
                const location = { longitude, latitude };

                setCurrentLocation(location);
                setSelectedLocation(location);
                setShowPopup(true);

                // Center map on current location
                setViewState(prev => ({
                    ...prev,
                    longitude,
                    latitude,
                    zoom: 16
                }));

                // Get address for current location
                try {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch address');
                    }

                    const data = await response.json();

                    let address = 'Current location';
                    if (data.features && data.features.length > 0) {
                        address = data.features[0].place_name;
                    }

                    setLocationInfo(address);

                    const locationData = {
                        address: address,
                        latitude: latitude,
                        longitude: longitude,
                        formatted: address
                    };

                    onLocationSelect(locationData);

                } catch (err) {
                    console.error('Geocoding error:', err);
                    const locationData = {
                        address: `Current Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        latitude: latitude,
                        longitude: longitude,
                        formatted: `Current Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    };

                    onLocationSelect(locationData);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error getting current location:', error);
                setError('Could not access your current location');
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // Search for locations using Mapbox Geocoding API
    const searchLocation = async (query) => {
        if (!query.trim() || disabled) return;

        setIsSearching(true);
        setError('');

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=5`
            );

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data.features || []);
            setShowSearchResults(true);

        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search locations. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input change with debouncing
    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Simple debouncing - search after user stops typing for 500ms
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            if (value.trim().length >= 3) {
                searchLocation(value);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 500);
    };

    // Select a search result
    const selectSearchResult = (feature) => {
        const [longitude, latitude] = feature.center;
        const address = feature.place_name;

        setSelectedLocation({ longitude, latitude });
        setLocationInfo(address);
        setShowPopup(true);
        setSearchQuery(address);
        setShowSearchResults(false);

        // Move map to selected location
        setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom: 15
        }));

        // Send location data to parent
        const locationData = {
            address: address,
            latitude: latitude,
            longitude: longitude,
            formatted: address
        };

        onLocationSelect(locationData);
    };

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-red-700 font-medium">Mapbox token not found</p>
                    <p className="text-red-600 text-sm mt-1">
                        Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                        Current token: {MAPBOX_TOKEN ? 'Found' : 'Not found'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Map Controls */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Click on the map to select complaint location
                </p>
                <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={disabled || loading}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Locating...</span>
                        </>
                    ) : (
                        <>
                            <span>📍</span>
                            <span>Use Current Location</span>
                        </>
                    )}
                </button>
            </div>

            {/* Search Location Input */}
            <div className="relative">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="🔍 Search for any location (e.g., MG Road, Bangalore)"
                            value={searchQuery}
                            onChange={handleSearchInput}
                            disabled={disabled || isSearching}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                                setShowSearchResults(false);
                            }}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map((result, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => selectSearchResult(result)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100"
                            >
                                <div className="flex items-start space-x-2">
                                    <span className="text-blue-600 mt-0.5">📍</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {result.text}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {result.place_name}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* No Results Message */}
                {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                        <p className="text-sm text-gray-500 text-center">
                            No locations found for "{searchQuery}"
                        </p>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                    <p className="text-sm text-red-700">⚠️ {error}</p>
                </div>
            )}

            {/* Map Container */}
            <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    cursor="crosshair"
                >
                    {/* Navigation Controls */}
                    <NavigationControl position="top-right" />

                    {/* Geolocation Control */}
                    <GeolocateControl
                        position="top-right"
                        trackUserLocation
                        showUserHeading
                    />

                    {/* Current Location Marker (Blue) */}
                    {currentLocation && (
                        <Marker
                            longitude={currentLocation.longitude}
                            latitude={currentLocation.latitude}
                            anchor="center"
                        >
                            <CustomMarker
                                longitude={currentLocation.longitude}
                                latitude={currentLocation.latitude}
                                color="#3b82f6"
                            />
                        </Marker>
                    )}

                    {/* Selected Location Marker (Red) */}
                    {selectedLocation && (
                        <Marker
                            longitude={selectedLocation.longitude}
                            latitude={selectedLocation.latitude}
                            anchor="center"
                        >
                            <CustomMarker
                                longitude={selectedLocation.longitude}
                                latitude={selectedLocation.latitude}
                                color="#ef4444"
                            />
                        </Marker>
                    )}

                    {/* Popup for selected location */}
                    {showPopup && selectedLocation && (
                        <Popup
                            longitude={selectedLocation.longitude}
                            latitude={selectedLocation.latitude}
                            anchor="bottom"
                            onClose={() => setShowPopup(false)}
                            closeButton={true}
                            closeOnClick={false}
                        >
                            <div className="p-2 max-w-xs">
                                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                                    Complaint Location
                                </h3>
                                {loading ? (
                                    <p className="text-xs text-gray-600">Getting address...</p>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-700 mb-2">{locationInfo}</p>
                                        <p className="text-xs text-gray-500">
                                            Lat: {selectedLocation.latitude.toFixed(6)}<br />
                                            Lng: {selectedLocation.longitude.toFixed(6)}
                                        </p>
                                    </>
                                )}
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    📍 How to select location:
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>Click anywhere</strong> on the map to select complaint location</li>
                    <li>• Use <strong>"Current Location"</strong> to quickly select where you are now</li>
                    <li>• <strong>Blue marker</strong> shows your current position</li>
                    <li>• <strong>Red marker</strong> shows your selected complaint location</li>
                    <li>• Use navigation controls to zoom and move around the map</li>
                </ul>
            </div>
        </div>
    );
}

export default LocationPicker;
