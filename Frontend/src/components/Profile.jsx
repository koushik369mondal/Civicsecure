import React, { useState, useRef } from "react";

export default function Profile({ setCurrentPage }) {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleAadhaarVerification = () => {
    if (setCurrentPage) {
      setCurrentPage("aadhaar-verify");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile updated!");
  };

  // REMOVED THE LAYOUT WRAPPER - NOW STANDALONE COMPONENT
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl shadow-lg p-6 lg:p-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
          User Profile
        </h1>
        <p className="text-lg text-white">
          Manage your account information and preferences
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="text-center mb-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            
            <div
              onClick={handlePhotoClick}
              className="relative mx-auto w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden cursor-pointer hover:border-green-500 transition-all duration-300 group"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="text-sm font-medium">Add Photo</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Click photo area to upload • JPG, PNG or GIF (max 5MB)
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Aadhaar Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                maxLength={12}
                pattern="[0-9]{12}"
                className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your 12-digit Aadhaar number"
                required
              />
            </div>
          </div>

          {/* Aadhaar Verification Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Status:
            </span>
            {aadhaarVerified ? (
              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAadhaarVerification}
                className="text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full text-sm font-medium transition-colors"
              >
                Not Verified - Click to Verify
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
