import React from "react";
import Sidebar from "./Sidebar";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Layout({ 
  children, 
  sidebarOpen, 
  setSidebarOpen, 
  user, 
  onLogout, 
  currentPage, 
  setCurrentPage 
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={onLogout}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
          <h1 className="text-xl font-bold text-gray-900">CivicSecure</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
