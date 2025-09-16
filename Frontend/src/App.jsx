import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ComplaintForm from "./components/ComplaintForm";
import Profile from "./components/Profile";
import AadhaarVerification from "./components/AadhaarVerification";
import Login from "./components/Login";
import TrackStatus from "./components/Tracking";
import Community from "./components/shared/Community";
import InfoHub from "./components/shared/Info";
import { FaBars } from "react-icons/fa";

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // App state
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add useEffect to handle authentication loading
  useEffect(() => {
    // Simulate authentication check
    const checkAuth = () => {
      setTimeout(() => {
        setAuthLoading(false);
        // You can add actual auth logic here
      }, 1000);
    };
    checkAuth();
  }, []);

  // Handle login success
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setAuthLoading(false);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage("dashboard");
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "file-complaint":
        return <ComplaintForm user={user} />;
      case "profile":
        return <Profile setCurrentPage={setCurrentPage} />;
      case "aadhaar-verify":
        return <AadhaarVerification setCurrentPage={setCurrentPage} />;
      case "track-status":
        return <TrackStatus />;
      case "info-hub":
        return <InfoHub />;
      case "community":
        return <Community />;
      default:
        return (
          <div className="p-10 text-center text-gray-700 text-lg font-semibold">
            Page under construction
          </div>
        );
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-green-500"></span>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading CivicSecure...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app if authenticated
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1">
        <div className="navbar bg-white shadow-sm px-4 sm:hidden border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-3">CivicSecure</h1>
        </div>

        <main className="flex-grow overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
