import React from "react";
import { 
  FaHome, 
  FaFileAlt, 
  FaUser, 
  FaIdCard, 
  FaSearch, 
  FaInfoCircle, 
  FaUsers, 
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";
import ProfileAvatar from "./ProfileAvatar";

const Sidebar = ({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  setSidebarOpen,
  user,
  onLogout,
}) => {
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

  const handleProfileClick = () => {
    setCurrentPage("profile");
    setSidebarOpen(false);
  };

  // Logic for role display
  const displayRole = () => {
    if (!user || !user.role) return "";
    const roleLower = user.role.toString().toLowerCase();
    if (roleLower === "admin" || roleLower === "administrator") {
      return "Administrator";
    }
    if (roleLower === "customer") {
      return "Customer";
    }
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ease-in-out duration-300 bg-white border-r border-gray-200 shadow-lg ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      aria-label="Sidebar navigation"
    >
      {/* Header - Branding */}
      <div className="px-4 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CivicSecure</h1>
            <p className="text-xs text-gray-600">Citizen Grievance Hub</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="px-4 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group"
          >
            <ProfileAvatar name={user.name} avatarUrl={user.avatarUrl} />
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                {user.name}
              </div>
              <div className="text-xs text-gray-600">{displayRole()}</div>
            </div>
            <FaUser className="text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleMenuClick(id)}
            className={`flex items-center w-full px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentPage === id
                ? "bg-green-600 text-white shadow-md transform scale-105"
                : "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
            }`}
            aria-current={currentPage === id ? "page" : undefined}
          >
            <Icon
              className={`text-lg mr-3 ${
                currentPage === id ? "text-white" : "text-gray-600"
              }`}
            />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        {/* Logout Button */}
        {user && (
          <div className="p-3">
            <button
              onClick={() => {
                setSidebarOpen(false);
                if (onLogout) onLogout();
              }}
              className="flex items-center w-full px-3 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 hover:shadow-sm"
            >
              <FaSignOutAlt className="text-lg mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">Version 2.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
