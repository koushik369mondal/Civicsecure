import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import ComplaintForm from "./components/ComplaintForm";
import Profile from "./components/Profile";
import AadhaarVerification from "./components/AadhaarVerification";
import Tracking from "./components/Tracking";
import Chat from "./components/Chat";
import { FaSpinner } from "react-icons/fa";

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate auth check/load
    const checkAuth = async () => {
      try {
        // Simulate API call to check existing session
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Check localStorage for saved session
        const savedUser = localStorage.getItem('civicSecureUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Callback for successful login
  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    setCurrentPage("dashboard");
    // Save to localStorage for persistence
    localStorage.setItem('civicSecureUser', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
    setSidebarOpen(false);
    // Clear localStorage
    localStorage.removeItem('civicSecureUser');
  };

  // Route content based on currentPage and user role
  const renderPageContent = () => {
    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    const commonProps = {
      user,
      currentPage,
      sidebarOpen,
      setSidebarOpen,
      onLogout: handleLogout,
      setCurrentPage,
    };

    switch (currentPage) {
      case "dashboard":
        return user.role === "admin" ? 
          <AdminDashboard {...commonProps} /> : 
          <CustomerDashboard {...commonProps} />;
      
      case "file-complaint":
        return <ComplaintForm {...commonProps} />;
      
      case "track-status":
        return <Tracking {...commonProps} />;
      
      case "profile":
        return <Profile {...commonProps} />;
      
      case "aadhaar-verify":
        return <AadhaarVerification {...commonProps} />;
      
      case "chat":
        return <Chat {...commonProps} />;
      
      default:
        return user.role === "admin" ? 
          <AdminDashboard {...commonProps} /> : 
          <CustomerDashboard {...commonProps} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CivicSecure</h1>
          </div>
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <Layout
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={handleLogout}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        >
          {renderPageContent()}
        </Layout>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          {renderPageContent()}
        </div>
      )}
    </div>
  );
}

export default App;
