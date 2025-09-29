import React, { useState } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaUsers, FaFileAlt, FaChartLine } from "react-icons/fa";

export default function AdminDashboard({ user, sidebarOpen, setSidebarOpen, onLogout, currentPage, setCurrentPage }) {
  const stats = [
    { label: "Total Complaints", value: 24, icon: FaExclamationTriangle, color: "text-blue-600", bgColor: "bg-blue-100" },
    { label: "Resolved", value: 18, icon: FaCheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    { label: "Pending", value: 6, icon: FaClock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { label: "Active Users", value: 156, icon: FaUsers, color: "text-purple-600", bgColor: "bg-purple-100" },
  ];

  const recentComplaints = [
    { id: "CMP-001", category: "Roads & Infrastructure", status: "Pending", date: "2025-09-12", priority: "High" },
    { id: "CMP-002", category: "Water Supply", status: "Resolved", date: "2025-09-11", priority: "Medium" },
    { id: "CMP-003", category: "Public Safety", status: "In Progress", date: "2025-09-10", priority: "High" },
    { id: "CMP-004", category: "Sanitation", status: "Pending", date: "2025-09-09", priority: "Low" },
    { id: "CMP-005", category: "Electricity", status: "Resolved", date: "2025-09-08", priority: "Medium" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-800 to-blue-800 rounded-xl shadow-lg p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
              Admin Dashboard
            </h1>
            <p className="text-lg text-white opacity-90">
              Welcome back, {user?.name}! Here's your system overview.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg">
              <FaChartLine className="mr-2" />
              <span className="text-sm font-medium">System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bgColor }, idx) => (
          <div key={idx} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
              </div>
              <div className={`${bgColor} p-3 rounded-lg`}>
                <Icon className={`${color} text-xl`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              Recent Complaints
            </h3>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Export Data
              </button>
              <button 
                onClick={() => setCurrentPage("track-status")}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentComplaints.map(({ id, category, status, date, priority }) => (
                <tr key={id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-700">{category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    {date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-green-600 hover:text-green-800 font-medium mr-3">
                      View
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Generate Monthly Report
            </button>
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Manage User Accounts
            </button>
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              System Settings
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">System Health</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Status</span>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="text-green-600 font-medium">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response</span>
              <span className="text-green-600 font-medium">Fast</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-gray-900">New complaint submitted</p>
                <p className="text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-gray-900">Complaint status updated</p>
                <p className="text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="text-gray-900">User account created</p>
                <p className="text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
