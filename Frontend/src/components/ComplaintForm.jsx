import React, { useState } from "react";
import Layout from "./Layout";
import AadhaarVerification from './AadhaarVerification';

function ComplaintForm() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reporterType, setReporterType] = useState("anonymous");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Aadhaar verification state
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarData, setAadhaarData] = useState(null);

  // Simple local file selection handler; files stored but not uploaded yet
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if reporter type is verified and Aadhaar is required
    if (reporterType === "verified" && !aadhaarVerified) {
      alert('Please verify your Aadhaar number before submitting a verified complaint');
      return;
    }

    // Simulate uploading for 2 seconds (disable submit while uploading)
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      alert("Complaint submitted (simulated)!");
      
      // Clear form after submission
      setCategory("");
      setDescription("");
      setLocation("");
      setReporterType("anonymous");
      setAttachments([]);
      setAadhaarVerified(false);
      setAadhaarData(null);
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Submit a Complaint
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Aadhaar Verification Section - Only show when "Verified (Aadhaar)" is selected */}
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
                
                {/* Show verification status */}
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

            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Category
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

            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Description
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

            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Location
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter address or GPS coordinates"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={uploading}
              />
            </div>

            <div className="w-full">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Reporter Type
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
                onChange={handleAttachmentChange}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
              )}
              {attachments.length > 0 && !uploading && (
                <p className="text-sm text-gray-600 mt-2">
                  {attachments.length} file(s) selected
                </p>
              )}
            </div>

            <div className="pt-4">
              {reporterType === "verified" && !aadhaarVerified && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md mb-4">
                  <p className="text-sm text-orange-700 text-center">
                    ⚠️ Please complete Aadhaar verification to submit a verified complaint
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || (reporterType === "verified" && !aadhaarVerified)}
                  className={`px-6 py-3 rounded-md font-semibold transition-colors w-full sm:w-auto ${
                    uploading || (reporterType === "verified" && !aadhaarVerified)
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {uploading ? 'Submitting...' : 'Submit Complaint'}
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
