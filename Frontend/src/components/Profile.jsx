import React, { useState, useRef } from "react";
import Layout from "./Layout";

export default function Profile({ setCurrentPage }) {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false); // Track verification status
  
  // Create a reference to the hidden file input
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files;
    if (file) {
      // Create preview URL for local display
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  // Function to trigger file input when photo area is clicked
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  // Function to navigate to Aadhaar verification page
  const handleAadhaarVerification = () => {
    if (setCurrentPage) {
      setCurrentPage("aadhaar-verify");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic such as API calls here
    alert("Profile updated!");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center">
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          {/* Clickable photo area */}
          <div 
            onClick={handlePhotoClick}
            className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden mb-4 border-4 border-green-200 shadow-lg cursor-pointer hover:border-green-400 hover:shadow-xl transition-all duration-200"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 text-base hover:text-green-600 transition-colors duration-200">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">Add Photo</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mt-2">Click photo area to upload • JPG, PNG or GIF (max 5MB)</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-base font-medium text-gray-900 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-base font-medium text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Aadhaar Number with Verification Status */}
          <div>
            <label htmlFor="aadhaar" className="block text-base font-medium text-gray-900 mb-2">
              Aadhaar Number
            </label>
            <input
              type="text"
              id="aadhaar"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              maxLength={12}
              pattern="[0-9]{12}"
              className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Enter your 12-digit Aadhaar number"
              required
            />
            
            {/* Aadhaar Verification Status */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-900">Status:</span>
              {aadhaarVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleAadhaarVerification}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 hover:text-orange-900 text-sm font-medium rounded-full cursor-pointer transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Not Verified - Click to Verify
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl min-w-48"
          >
            Update Profile
          </button>
        </div>
      </form>
      </div>
    </Layout>
  );
}
