import React, { useState } from "react";
import Layout from "./Layout";
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaUsers, 
  FaArrowUp,
  FaChartBar,
  FaEdit,
  FaEye
} from "react-icons/fa";

export default function AdminDashboard({
  user,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  currentPage,
  setCurrentPage,
}) {
  const [complaints, setComplaints] = useState([
    { id: 1, user: "Alice Johnson", category: "Safety", description: "Broken streetlight on Main St", status: "Pending", priority: "High", date: "2025-09-12" },
    { id: 2, user: "Bob Smith", category: "Road", description: "Large pothole causing traffic issues", status: "In Progress", priority: "Medium", date: "2025-09-11" },
    { id: 3, user: "Carol Davis", category: "Sanitation", description: "Garbage not collected for 3 days", status: "Resolved", priority: "Low", date: "2025-09-10" },
    { id: 4, user: "David Wilson", category: "Water", description: "Water pressure very low", status: "Pending", priority: "High", date: "2025-09-09" },
    { id: 5, user: "Emma Brown", category: "Electricity", description: "Frequent power outages", status: "In Progress", priority: "High", date: "2025-09-08" },
  ]);

  const stats = [
    { label: "Total Complaints", value: complaints.length, icon: FaExclamationTriangle, color: "text-blue-600", bgColor: "bg-blue-50", trend: "+12%" },
    { label: "Resolved", value: complaints.filter(c => c.status === "Resolved").length, icon: FaCheckCircle, color: "text-green-600", bgColor: "bg-green-50", trend: "+8%" },
    { label: "In Progress", value: complaints.filter(c => c.status === "In Progress").length, icon: FaClock, color: "text-yellow-600", bgColor: "bg-yellow-50", trend: "+3%" },
    { label: "Active Users", value: 1247, icon: FaUsers, color: "text-purple-600", bgColor: "bg-purple-50", trend: "+15%" },
  ];

  const updateStatus = (id) => {
    const statusCycle = { "Pending": "In Progress", "In Progress": "Resolved", "Resolved": "Pending" };
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: statusCycle[c.status] } : c)
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-600 bg-red-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "text-green-700 bg-green-100";
      case "In Progress": return "text-blue-700 bg-blue-100";
      case "Pending": return "text-yellow-700 bg-yellow-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header - Dark Green background with white text */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Welcome back, {user.name}! 👋</h1>
            <p style={{ color: '#ffffff' }}>Here's what's happening in your city today</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm" style={{ color: '#ffffff' }}>System Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium" style={{ color: '#ffffff' }}>All Systems Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bgColor, trend }, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={`text-2xl ${color}`} />
              </div>
              <div className="flex items-center space-x-1">
                <FaArrowUp className="text-green-500 text-sm" />
                <span className="text-green-500 text-sm font-medium">{trend}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-gray-600 text-sm font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaChartBar className="mr-2 text-green-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setCurrentPage("community")}
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <FaUsers className="text-blue-600 mr-3 text-xl" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View & manage user accounts</p>
            </div>
          </button>
          <button 
            onClick={() => setCurrentPage("track-status")}
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <FaExclamationTriangle className="text-green-600 mr-3 text-xl" />
            <div className="text-left">
              <p className="font-medium text-gray-900">All Complaints</p>
              <p className="text-sm text-gray-600">View detailed complaint list</p>
            </div>
          </button>
          <button 
            onClick={() => setCurrentPage("settings")}
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FaChartBar className="text-purple-600 mr-3 text-xl" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-600">View system reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaExclamationTriangle className="mr-2 text-green-600" />
            Recent Complaints
          </h3>
          <button 
            onClick={() => setCurrentPage("track-status")}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Issue</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Priority</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 5).map((complaint) => (
                <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-medium text-sm">
                          {complaint.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{complaint.user}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-gray-900">{complaint.description}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-gray-600">{complaint.category}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-gray-600">{complaint.date}</span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateStatus(complaint.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Update Status"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 p-1"
                        title="View Details"
                      >
                        <FaEye className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
