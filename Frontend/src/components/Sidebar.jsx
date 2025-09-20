import React from "react";
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaInfoCircle,
  FaComments,
  FaIdCard,
  FaUser,
  FaSignOutAlt,
  FaShieldAlt
} from "react-icons/fa";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: FaHome },
  { id: "file-complaint", label: "File Complaint", icon: FaFileAlt },
  { id: "track-status", label: "Track Status", icon: FaChartBar },
  { id: "info-hub", label: "Info Hub", icon: FaInfoCircle },
  { id: "community", label: "Community", icon: FaComments },
  { id: "aadhaar-verify", label: "Aadhaar Verify", icon: FaIdCard },
  { id: "profile", label: "Profile", icon: FaUser }
];

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, onLogout }) {

  // Enhanced logout function that clears all data
  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm(
      "Are you sure you want to logout? This will clear all your saved data including profile information and Aadhaar verification."
    );

    if (confirmLogout) {
      try {
        // Clear all specific application data
        const keysToRemove = [
          'userProfile',           // Profile data
          'aadhaarVerification',   // Aadhaar verification data
          'complaintDraft',        // Any draft complaints
          'userPreferences',       // User preferences if any
          'sessionData',           // Session data if any
          'tempData',              // Any temporary data
          'userComplaints'         // User submitted complaints
        ];

        // Remove specific keys first (more controlled approach)
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Also clear sessionStorage if you're using it
        sessionStorage.clear();

        // Close sidebar if open
        if (sidebarOpen) setSidebarOpen(false);

        // Reset to dashboard page
        if (setCurrentPage) {
          setCurrentPage("dashboard");
        }

        // Call parent logout handler if provided
        if (onLogout) {
          onLogout();
        }

        // Optional: Show success message
        alert("Successfully logged out! All data has been cleared.");

      } catch (error) {
        console.error('Error during logout:', error);
        alert("An error occurred during logout. Please try again.");
      }
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ease-in-out duration-300 bg-white border-r border-gray-200 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      aria-label="Sidebar"
    >
      {/* Header - Responsive Design */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        <div className="flex items-center justify-between lg:justify-start">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 bg-emerald-600 text-white rounded-lg flex-shrink-0">
              <FaShieldAlt className="text-base sm:text-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-emerald-600 truncate">
                CivicSecure
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm truncate">
                Citizen Grievance Hub
              </p>
            </div>
          </div>

          {/* Close Button for Mobile/Tablet */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
        <nav>
          <ul className="space-y-2 sm:space-y-3">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => {
                    setCurrentPage(id);
                    if (sidebarOpen) setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 group ${currentPage === id
                    ? "bg-emerald-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:transform hover:scale-102"
                    }`}
                  aria-current={currentPage === id ? "page" : undefined}
                >
                  <Icon
                    className={`text-base sm:text-lg mr-3 sm:mr-4 transition-colors duration-200 flex-shrink-0 ${currentPage === id
                      ? "text-white"
                      : "text-gray-600 group-hover:text-emerald-600"
                      }`}
                  />
                  <span className="text-sm font-medium truncate">{label}</span>
                  {currentPage === id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-3 sm:px-4 pb-4">
        {/* Enhanced Logout Button with confirmation */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border-2 border-red-200 hover:border-red-300 mb-3 sm:mb-4 group"
        >
          <FaSignOutAlt className="text-base sm:text-lg mr-3 sm:mr-4 group-hover:animate-pulse flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>

        {/* Footer */}
        <div className="pt-2 sm:pt-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-1">Version 1.0.0</p>
          <p className="text-xs text-gray-400">© 2025 CivicSecure</p>
        </div>
      </div>
    </aside>
  );
}
