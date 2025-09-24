import React, { useState } from "react";
import Layout from "./Layout";
import AadhaarVerification from './AadhaarVerification';
import SafeLocationPicker from './SafeLocationPicker'; // Use the safe version
import ErrorBoundary from './ErrorBoundary';
import { complaintAPI } from '../services/api';

function ComplaintForm() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({
    address: "",
    latitude: null,
    longitude: null,
    formatted: ""
  });
  const [reporterType, setReporterType] = useState("anonymous");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Aadhaar verification state
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarData, setAadhaarData] = useState(null);

  // Simple local file selection handler
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  // Handle Aadhaar verification results
  const handleAadhaarVerification = (result) => {
    setAadhaarVerified(result.success);
    setAadhaarData(result.data || null);

    if (result.success) {
      console.log('Aadhaar verified for:', result.data?.name);
    }
  };

  // Handle location selection from Mapbox
  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if location is provided (either coordinates or manual address)
    if (!location.formatted && !location.address) {
      alert('Please provide a location for your complaint');
      return;
    }

    // Check if reporter type is verified and Aadhaar is required
    if (reporterType === "verified" && !aadhaarVerified) {
      alert('Please verify your Aadhaar number before submitting a verified complaint');
      return;
    }

    // Prepare complaint data for backend
    const complaintData = {
      category,
      description,
      location: {
        address: location.address || location.formatted,
        latitude: location.latitude,
        longitude: location.longitude,
        formatted: location.formatted || location.address
      },
      reporterType,
      aadhaarData: aadhaarVerified ? aadhaarData : null,
      attachments: attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    console.log('🚀 Submitting complaint to backend:', complaintData);

    try {
      setUploading(true);
      
      // Submit complaint to backend
      const response = await complaintAPI.submitComplaint(complaintData);
      
      console.log('✅ Complaint submitted successfully:', response);
      
      // Show success message
      alert(`Complaint submitted successfully!\nComplaint ID: ${response.data.complaintId}\nStatus: ${response.data.status}`);

      // Clear form after successful submission
      setCategory("");
      setDescription("");
      setLocation({
        address: "",
        latitude: null,
        longitude: null,
        formatted: ""
      });
      setReporterType("anonymous");
      setAttachments([]);
      setAadhaarVerified(false);
      setAadhaarData(null);
      
    } catch (error) {
      console.error('❌ Error submitting complaint:', error);
      
      // Show error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit complaint';
      alert(`Error: ${errorMessage}`);
      
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Submit a Complaint
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Aadhaar Verification Section */}
            {reporterType === "verified" && (
              <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Identity Verification
                </h3>
                <AadhaarVerification
                  mode="simple"
                  onVerificationComplete={handleAadhaarVerification}
                  isRequired={true}
                />

                {aadhaarVerified && aadhaarData && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-green-800">
                        ✅ Identity verified for <strong>{aadhaarData.name}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category Selection */}
            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Category <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={uploading}
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="plot">Plot Issue</option>
                <option value="road">Road Issue</option>
                <option value="plumbing">Plumbing</option>
                <option value="electricity">Electricity</option>
                <option value="water">Water Supply</option>
                <option value="garbage">Garbage</option>
                <option value="noise">Noise</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Description */}
            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Description <span className="text-red-500">*</span>
                </span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 min-h-[120px]"
                placeholder="Describe your complaint in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={uploading}
              />
            </div>

            {/* Location Picker Section */}
            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Location <span className="text-red-500">*</span>
                </span>
              </label>
              <SafeLocationPicker
                onLocationSelect={handleLocationSelect}
                disabled={uploading}
              />

              {/* Display selected location */}
              {location.formatted && (
                <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Selected Location:
                      </p>
                      <p className="text-sm text-green-700">
                        {location.formatted}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Coordinates: {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reporter Type */}
            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Reporter Type <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                value={reporterType}
                onChange={(e) => setReporterType(e.target.value)}
                required
                disabled={uploading}
              >
                <option value="anonymous">Anonymous</option>
                <option value="pseudonymous">Pseudonymous</option>
                <option value="verified">Verified (Aadhaar)</option>
              </select>
            </div>

            {/* Attachments */}
            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Attachments
                </span>
              </label>
              <input
                type="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleAttachmentChange}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
              )}
              {attachments.length > 0 && !uploading && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {attachments.length} file(s) selected:
                  </p>
                  <ul className="text-xs text-gray-500 mt-1">
                    {attachments.slice(0, 3).map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                    {attachments.length > 3 && (
                      <li>• ... and {attachments.length - 3} more files</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Section */}
            <div className="pt-4">
              {/* Validation Messages */}
              {reporterType === "verified" && !aadhaarVerified && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md mb-4">
                  <p className="text-sm text-orange-700 text-center">
                    ⚠️ Please complete Aadhaar verification to submit a verified complaint
                  </p>
                </div>
              )}

              {(!location.latitude || !location.longitude) && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md mb-4">
                  <p className="text-sm text-orange-700 text-center">
                    📍 Please select a location on the map above
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    uploading ||
                    (reporterType === "verified" && !aadhaarVerified) ||
                    (!location.latitude || !location.longitude) ||
                    !category ||
                    !description
                  }
                  className={`px-8 py-3 rounded-md font-semibold transition-all duration-200 w-full sm:w-auto ${uploading ||
                      (reporterType === "verified" && !aadhaarVerified) ||
                      (!location.latitude || !location.longitude) ||
                      !category ||
                      !description
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" strokeOpacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ComplaintForm;
