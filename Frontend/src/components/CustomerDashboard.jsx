import React, { useState } from "react";
import Layout from "./Layout";
import { FaFileAlt, FaSearch, FaUser, FaBell } from "react-icons/fa";

export default function CustomerDashboard({ 
  user, 
  currentPage, 
  sidebarOpen, 
  setSidebarOpen, 
  onLogout, 
  setCurrentPage 
}) {
  const [complaints, setComplaints] = useState([
    { id: 1, title: "Broken streetlight", status: "Pending" },
    { id: 2, title: "Pothole", status: "Solved" },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email || "",
  });

  // Updated with simple solid colors: olive, lavender/purple, and indigo
  const quickActions = [
    { 
      id: "file-complaint", 
      label: "File New Complaint", 
      icon: FaFileAlt, 
      color: "bg-yellow-600 hover:bg-yellow-700", // Olive-ish color
      description: "Report a new issue in your area" 
    },
    { 
      id: "track-status", 
      label: "Track Complaints", 
      icon: FaSearch, 
      color: "bg-purple-400 hover:bg-purple-500", // Lavender/purple color
      description: "Check the status of your reports" 
    },
    { 
      id: "profile", 
      label: "My Profile", 
      icon: FaUser, 
      color: "bg-indigo-600 hover:bg-indigo-700", // Indigo color
      description: "Update your account settings" 
    },
  ];

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formError) setFormError("");
  };

  const handleProfileChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      setFormError("Please fill in all complaint fields.");
      return;
    }
    const newComplaint = {
      id: complaints.length + 1,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      status: "Pending",
    };
    setComplaints((prev) => [...prev, newComplaint]);
    setFormData({ title: "", category: "", description: "" });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Placeholder for profile update
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Solved": return "text-green-700 bg-green-100";
      case "Pending": return "text-yellow-700 bg-yellow-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      user={user}
      onLogout={onLogout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      {currentPage === "dashboard" && (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Header - Dark Green solid background with white text */}
          <div className="bg-green-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Welcome back, {user.name}! 🏠</h1>
                <p style={{ color: '#ffffff' }}>Let's make your community better together</p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 bg-white bg-opacity-60 rounded-lg p-3">
                  <FaBell className="text-yellow-300 animate-pulse" />
                  <span className="text-sm" style={{ color: '#000000' }}>2 updates available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Complaints", value: complaints.length, color: "text-blue-600", bgColor: "bg-blue-50" },
              { label: "Resolved", value: complaints.filter(c => c.status === "Solved").length, color: "text-green-600", bgColor: "bg-green-50" },
              { label: "In Progress", value: 0, color: "text-blue-600", bgColor: "bg-blue-50" },
              { label: "Pending", value: complaints.filter(c => c.status === "Pending").length, color: "text-yellow-600", bgColor: "bg-yellow-50" },
            ].map(({ label, value, color, bgColor }, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
                  <span className={`text-xl font-bold ${color}`}>{value}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions with white text */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map(({ id, label, icon: Icon, color, description }) => (
                <button
                  key={id}
                  onClick={() => setCurrentPage(id)}
                  className={`${color} p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-left`}
                >
                  <Icon className="text-3xl mb-4" style={{ color: '#ffffff' }} />
                  <h4 className="font-semibold text-lg mb-2" style={{ color: '#ffffff' }}>{label}</h4>
                  <p className="text-sm opacity-90" style={{ color: '#ffffff' }}>{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaFileAlt className="mr-2 text-green-600" />
                My Recent Complaints
              </h3>
              <button 
                onClick={() => setCurrentPage("track-status")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            
            {complaints.length === 0 ? (
              <div className="text-center py-8">
                <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500">No complaints filed yet</p>
                <button 
                  onClick={() => setCurrentPage("file-complaint")}
                  className="mt-3 text-green-600 hover:text-green-700 font-medium"
                >
                  File your first complaint →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{complaint.title}</p>
                      <p className="text-sm text-gray-600 mt-1">Filed recently</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentPage === "file-complaint" && (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">File a Complaint</h2>
            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <input
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                  formError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange("title")}
              />
              <input
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                  formError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="Category"
                value={formData.category}
                onChange={handleInputChange("category")}
              />
              <textarea
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                  formError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange("description")}
                rows={4}
              />
              {formError && (
                <p role="alert" className="text-red-600 font-semibold">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Submit Complaint
              </button>
            </form>
          </div>
        </div>
      )}

      {currentPage === "track-status" && (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Track Status</h2>
            {complaints.length === 0 ? (
              <p className="text-gray-600">No complaints filed yet.</p>
            ) : (
              <ul className="space-y-3">
                {complaints.map(({ id, title, status }) => (
                  <li key={id} className="p-4 border border-gray-200 rounded-md">
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-gray-700">
                      Status: <span className="capitalize font-medium">{status}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {currentPage === "profile" && (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Profile / Settings</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.name}
                  onChange={handleProfileChange("name")}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.email}
                  onChange={handleProfileChange("email")}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {currentPage === "settings" && (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            <p>Settings placeholder.</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
