import React from "react";
import { FaHome, FaFileAlt, FaUser, FaIdCard, FaSearch, FaInfoCircle, FaUsers, FaSignOutAlt } from "react-icons/fa";

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "file-complaint", label: "File Complaint", icon: FaFileAlt },
    { id: "track-status", label: "Track Status", icon: FaSearch },
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "aadhaar-verify", label: "Verify Aadhaar", icon: FaIdCard },
    { id: "info-hub", label: "Info Hub", icon: FaInfoCircle },
    { id: "community", label: "Community", icon: FaUsers },
  ];

  const handleMenuClick = (pageId) => {
    setCurrentPage(pageId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ease-in-out duration-300 bg-white border-r border-gray-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0`}
      aria-label="Sidebar"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-1">CivicSecure</h1>
        <p className="text-gray-700 text-sm">Citizen Grievance Hub</p>
      </div>

      {/* Menu Items */}
      <div className="px-3 py-3 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => {
                  setCurrentPage(id);
                  if (sidebarOpen) setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 ${
                  currentPage === id
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-800 hover:bg-green-50 hover:text-gray-900"
                }`}
                aria-current={currentPage === id ? "page" : undefined}
              >
                <Icon
                  className={`text-lg mr-3 ${
                    currentPage === id 
                      ? "text-white" 
                      : "text-gray-700"
                  }`}
                />
                <span className="text-sm font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-8 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              if (sidebarOpen) setSidebarOpen(false);
              if (onLogout) onLogout();
            }}
            className="flex items-center w-full px-3 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          >
            <FaSignOutAlt className="text-lg mr-3" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
