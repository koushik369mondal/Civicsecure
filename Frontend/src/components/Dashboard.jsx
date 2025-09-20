import React, { useEffect } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaEye, FaPlus } from "react-icons/fa";
import Layout from "./Layout";

function Dashboard({ setCurrentPage }) {
  const stats = [
    { label: "Total Complaints", value: "24", icon: FaExclamationTriangle, color: "text-green-600" },
    { label: "Resolved", value: "18", icon: FaCheckCircle, color: "text-green-700" },
    { label: "Pending", value: "6", icon: FaClock, color: "text-amber-500" },
    { label: "In Review", value: "3", icon: FaEye, color: "text-blue-600" }
  ];

  const recentComplaints = [
    { id: "CMP-2024-001", category: "Safety", status: "Pending", date: "2025-09-12" },
    { id: "CMP-2024-002", category: "Civic", status: "Resolved", date: "2025-09-11" },
    { id: "CMP-2024-003", category: "Disaster", status: "In Review", date: "2025-09-10" }
  ];

  // Initialize Tawk.to chat bot
  useEffect(() => {
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                  <p className="text-gray-700 font-medium text-sm">{label}</p>
                </div>
                <Icon className={`${color} text-3xl`} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Complaints</h2>
            <div className="divide-y divide-gray-200">
              {recentComplaints.map(({ id, category, status, date }) => (
                <div key={id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{id}</p>
                    <p className="text-sm text-gray-700">{category}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {status}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">{date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-4 py-2 border border-green-300 text-gray-900 hover:bg-green-50 hover:border-green-400 rounded-md font-medium transition-colors">
                View All
              </button>
            </div>
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
