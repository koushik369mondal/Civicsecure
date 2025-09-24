import React, { useEffect, useState } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaEye, FaPlus, FaSpinner } from "react-icons/fa";
import Layout from "./Layout";
import { complaintAPI } from "../services/api";

function Dashboard({ setCurrentPage }) {
  // State for dynamic data
  const [stats, setStats] = useState([
    { label: "Total Complaints", value: "0", icon: FaExclamationTriangle, color: "text-green-600" },
    { label: "Resolved", value: "0", icon: FaCheckCircle, color: "text-green-700" },
    { label: "Pending", value: "0", icon: FaClock, color: "text-amber-500" },
    { label: "In Progress", value: "0", icon: FaEye, color: "text-blue-600" }
  ]);

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaint statistics from API
  const fetchComplaintStats = async () => {
    try {
      const response = await complaintAPI.getComplaintStats();
      if (response.success) {
        const { overview } = response.data;
        setStats([
          { 
            label: "Total Complaints", 
            value: overview.total_complaints || "0", 
            icon: FaExclamationTriangle, 
            color: "text-green-600" 
          },
          { 
            label: "Resolved", 
            value: overview.resolved || "0", 
            icon: FaCheckCircle, 
            color: "text-green-700" 
          },
          { 
            label: "Pending", 
            value: overview.pending || "0", 
            icon: FaClock, 
            color: "text-amber-500" 
          },
          { 
            label: "In Progress", 
            value: overview.in_progress || "0", 
            icon: FaEye, 
            color: "text-blue-600" 
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      setError('Failed to load complaint statistics');
    }
  };

  // Fetch recent complaints from API
  const fetchRecentComplaints = async () => {
    try {
      const response = await complaintAPI.getComplaints({ limit: 5 });
      if (response.success) {
        const formattedComplaints = response.data.map(complaint => ({
          id: complaint.complaint_id,
          category: formatCategory(complaint.category),
          status: formatStatus(complaint.status),
          date: new Date(complaint.created_at).toLocaleDateString()
        }));
        setRecentComplaints(formattedComplaints);
      }
    } catch (error) {
      console.error('Error fetching recent complaints:', error);
      setError('Failed to load recent complaints');
    }
  };

  // Helper function to format category names
  const formatCategory = (category) => {
    const categoryMap = {
      'road_infrastructure': 'Road & Infrastructure',
      'waste_management': 'Waste Management',
      'water_supply': 'Water Supply',
      'electricity': 'Electricity',
      'public_safety': 'Public Safety',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  // Helper function to format status
  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchComplaintStats(), fetchRecentComplaints()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Tawk.to chat bot and load dashboard data
  useEffect(() => {
    // Load dashboard data
    loadDashboardData();

    // Check if Tawk.to script is already loaded to avoid duplicates
    if (!window.Tawk_API) {
      // Initialize Tawk.to variables
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Create and load the Tawk.to script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/6868d4e6d7341f191194943f/1ivcnva4g';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      // Insert script before the first existing script tag
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        // Fallback: append to head if no scripts found
        document.head.appendChild(script);
      }

      // Optional: Add event listeners for Tawk.to events
      window.Tawk_API.onLoad = function () {
        console.log('💬 Tawk.to chat widget loaded successfully');
      };

      window.Tawk_API.onChatMaximized = function () {
        console.log('💬 Chat window maximized');
      };

      window.Tawk_API.onChatMinimized = function () {
        console.log('💬 Chat window minimized');
      };

      // Customize chat widget (optional)
      window.Tawk_API.customStyle = {
        visibility: {
          desktop: {
            position: 'br', // bottom-right
            xOffset: 20,
            yOffset: 20
          },
          mobile: {
            position: 'br',
            xOffset: 10,
            yOffset: 10
          }
        }
      };
    }

    // Cleanup function (optional)
    return () => {
      // You can add cleanup logic here if needed
      // Note: Tawk.to doesn't require explicit cleanup
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <Layout>
      <div className="space-y-8 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-700 text-base">Welcome back! Here's your complaint overview</p>
            {/* Optional: Add a small indicator that chat support is available */}
            {/* <p className="text-green-600 text-sm mt-1">
              💬 Need help? Our support chat is available in the bottom-right corner
            </p> */}
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2 font-medium transition-colors"
              onClick={() => setCurrentPage("file-complaint")}
            >
              <FaPlus />
              New Complaint
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={loadDashboardData}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    {loading ? (
                      <FaSpinner className="animate-spin text-gray-400 mr-2" />
                    ) : null}
                    {value}
                  </h3>
                  <p className="text-gray-700 font-medium text-sm">{label}</p>
                </div>
                <Icon className={`${color} text-3xl ${loading ? 'opacity-50' : ''}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
              {loading && (
                <FaSpinner className="animate-spin text-gray-400" />
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-4 flex justify-between items-center animate-pulse">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 bg-gray-200 rounded-full w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : recentComplaints.length > 0 ? (
                recentComplaints.map(({ id, category, status, date }) => (
                  <div 
                    key={id} 
                    className="py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors rounded-lg px-2"
                    onClick={() => {
                      localStorage.setItem("selectedComplaintId", id);
                      setCurrentPage("track-status");
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{id}</p>
                      <p className="text-sm text-gray-700">{category}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {status}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">{date}</p>
                    </div>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="py-8 text-center">
                  <div className="text-gray-400 text-4xl mb-2">📝</div>
                  <p className="text-gray-600 mb-2">No complaints yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Your submitted complaints will appear here
                  </p>
                  <button
                    onClick={() => setCurrentPage("file-complaint")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    File Your First Complaint
                  </button>
                </div>
              )}
            </div>
            {recentComplaints.length > 0 && (
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setCurrentPage("track-status")}
                  className="px-4 py-2 border border-green-300 text-gray-900 hover:bg-green-50 hover:border-green-400 rounded-md font-medium transition-colors"
                >
                  View All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optional: Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Assistance?</h3>
          <p className="text-blue-800 text-sm mb-3">
            Our support team is here to help you with any questions about filing or tracking complaints.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              💬 Live Chat Available
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📞 24/7 Support
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              📧 Email Support
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
