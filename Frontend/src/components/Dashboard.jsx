import React from "react";
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

  return (
    <Layout>
      <div className="space-y-8 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-700 text-base">Welcome back! Here's your complaint overview</p>
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
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status === "Resolved"
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
      </div>
    </Layout>
  );
}

export default Dashboard;
