import React, { useState } from "react";
import { FaFileAlt, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";

const ComplaintForm = ({ sidebarOpen, setSidebarOpen, user, onLogout, currentPage, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    priority: "medium",
    contactMethod: "email",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    "Roads & Infrastructure",
    "Water Supply",
    "Electricity",
    "Sanitation & Waste",
    "Public Safety",
    "Traffic & Transportation",
    "Environment",
    "Health Services",
    "Other",
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-red-600" },
  ];

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.contactMethod === "phone" && !formData.phone.trim()) {
      newErrors.phone = "Phone number is required when phone contact is selected";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          category: "",
          description: "",
          location: "",
          priority: "medium",
          contactMethod: "email",
          phone: "",
        });
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your complaint has been registered. You will receive a complaint ID shortly.
          </p>
          <p className="text-sm text-gray-500">
            Complaint ID: <span className="font-mono font-bold">CMP-{Math.floor(Math.random() * 10000)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">File a Complaint</h2>
        <p className="text-gray-600">Help us serve you better by reporting issues in your area</p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaFileAlt className="inline mr-2" />
              Complaint Title
            </label>
            <input
              type="text"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={handleInputChange("title")}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.category}
                onChange={handleInputChange("category")}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.priority}
                onChange={handleInputChange("priority")}
              >
                {priorities.map(({ value, label, color }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaMapMarkerAlt className="inline mr-2" />
              Location
            </label>
            <input
              type="text"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Specific location or address"
              value={formData.location}
              onChange={handleInputChange("location")}
            />
            {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description
            </label>
            <textarea
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Please provide detailed information about the issue..."
              value={formData.description}
              onChange={handleInputChange("description")}
              rows="5"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Contact Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.contactMethod}
                onChange={handleInputChange("contactMethod")}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both</option>
              </select>
            </div>

            {(formData.contactMethod === "phone" || formData.contactMethod === "both") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              onClick={() => {
                setFormData({
                  title: "",
                  category: "",
                  description: "",
                  location: "",
                  priority: "medium",
                  contactMethod: "email",
                  phone: "",
                });
                setErrors({});
              }}
            >
              Reset
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-900 mb-1">Emergency Issues</p>
            <p>For urgent matters, call our 24/7 helpline: <span className="font-mono">1800-XXX-XXXX</span></p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Response Time</p>
            <p>We typically respond within 24-48 hours depending on the issue priority.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
