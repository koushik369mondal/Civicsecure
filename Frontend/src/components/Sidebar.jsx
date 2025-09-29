import React, { useMemo } from "react";
import { 
  FaThLarge,        // Dashboard icon
  FaFileAlt, 
  FaSearch, 
  FaUser, 
  FaIdCard, 
  FaComments, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaBell
} from "react-icons/fa";
import ProfileAvatar from "./ProfileAvatar";

export default function Sidebar({ 
  user, 
  onLogout, 
  currentPage, 
  setCurrentPage, 
  sidebarOpen, 
  setSidebarOpen 
}) {
  
  const navigationItems = useMemo(() => {
    const adminItems = [
      { id: "dashboard", label: "Dashboard", icon: FaThLarge },
      { id: "track-status", label: "All Complaints", icon: FaSearch },
      { id: "community", label: "User Management", icon: FaUsers },
      { id: "profile", label: "Profile", icon: FaUser },
      { id: "settings", label: "Settings", icon: FaCog },
    ];

    const customerItems = [
      { id: "dashboard", label: "Dashboard", icon: FaThLarge },
      { id: "file-complaint", label: "File Complaint", icon: FaFileAlt },
      { id: "track-status", label: "Track Status", icon: FaSearch },
      { id: "profile", label: "Profile", icon: FaUser },
      { id: "aadhaar-verify", label: "Verify Aadhaar", icon: FaIdCard },
      { id: "chat", label: "Support Chat", icon: FaComments },
    ];

    return user?.role === "admin" ? adminItems : customerItems;
  }, [user?.role]);

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
    if (window.innerWidth < 1024) {
      setTimeout(() => setSidebarOpen(false), 150);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">CS</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CivicSecure</h1>
            <p className="text-xs text-gray-500">Connecting Citizens</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div 
          onClick={() => handleNavigation("profile")}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ProfileAvatar 
            name={user?.name || "User"} 
            avatarUrl={user?.avatarUrl}
            size="w-10 h-10"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {user?.name || "User Name"}
            </h3>
            <p className="text-sm text-gray-500 capitalize truncate">
              {user?.role || "Member"}
            </p>
          </div>
        </div>

        {/* Quick Stats Section - RESTORED */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
            <div className="text-lg font-bold text-blue-600">12</div>
            <div className="text-xs text-gray-600">
              {user?.role === "admin" ? "Total" : "Reports"}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
            <div className="text-lg font-bold text-green-600">8</div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navigationItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            
            return (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }
                `}
              >
                <Icon className={`text-lg ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="truncate">{label}</span>
                
                {/* Notification badges */}
                {id === "track-status" && !isActive && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs rounded-full px-2 py-1">
                    3
                  </span>
                )}
                
                {id === "chat" && !isActive && (
                  <span className="ml-auto bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-1">
                    2
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-3">
        {/* Notifications */}
        <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
          <FaBell className="text-lg text-gray-400" />
          <span className="text-sm font-medium">Notifications</span>
          <span className="ml-auto bg-red-100 text-red-600 text-xs rounded-full px-2 py-1">
            5
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
        >
          <FaSignOutAlt className="text-sm" />
          <span>Logout</span>
        </button>
        
        {/* App Version */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">CivicSecure v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
