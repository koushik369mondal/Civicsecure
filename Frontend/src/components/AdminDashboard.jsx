import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaUsers, FaFileAlt, FaChartLine, FaSpinner } from "react-icons/fa";
import { complaintAPI } from "../services/api";

export default function AdminDashboard({ user, sidebarOpen, setSidebarOpen, onLogout, currentPage, setCurrentPage }) {
  const [stats, setStats] = useState([
    { label: "Total Complaints", value: "-", icon: FaExclamationTriangle, color: "text-blue-600", bgColor: "bg-blue-100" },
    { label: "Resolved", value: "-", icon: FaCheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    { label: "Pending", value: "-", icon: FaClock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { label: "Active Users", value: "-", icon: FaUsers, color: "text-purple-600", bgColor: "bg-purple-100" },
  ]);

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let statsData = null;
      let complaintsData = [];

      // For admin dashboard, we should use public endpoints for system-wide data
      // TODO: Create proper admin-specific endpoints in the future
      
      try {
        // Use public stats endpoint for system-wide statistics
        const publicStatsResponse = await complaintAPI.getComplaintStats();
        const publicStats = publicStatsResponse.data.stats;
        
        // Convert public stats format to match expected format
        statsData = {
          totalComplaints: publicStats.total,
          statusCounts: {
            submitted: publicStats.status.pending,
            inProgress: publicStats.status.in_progress,
            resolved: publicStats.status.resolved,
            closed: publicStats.status.closed
          }
        };
        
        // Use public recent complaints endpoint for system-wide complaints
        const publicComplaintsResponse = await complaintAPI.getRecentComplaints({ limit: 5 });
        complaintsData = publicComplaintsResponse.data.complaints || [];
        
      } catch (publicError) {
        console.log('Public endpoints failed, trying authenticated endpoints as fallback:', publicError);
        
        // Fallback to authenticated endpoints (user-specific data)
        try {
          const statsResponse = await complaintAPI.getUserComplaintStats();
          statsData = statsResponse.data.data;
          
          const complaintsResponse = await complaintAPI.getUserComplaints({ limit: 5, sort: 'created_at', order: 'DESC' });
          complaintsData = complaintsResponse.data.data;
          
        } catch (authError) {
          console.error('Both public and authenticated endpoints failed:', authError);
          throw new Error('Unable to fetch data from any endpoint');
        }
      }

      // Update stats with real data
      const updatedStats = [
        { 
          label: "Total Complaints", 
          value: statsData.totalComplaints.toString(), 
          icon: FaExclamationTriangle, 
          color: "text-blue-600", 
          bgColor: "bg-blue-100" 
        },
        { 
          label: "Resolved", 
          value: (statsData.statusCounts.resolved + statsData.statusCounts.closed).toString(), 
          icon: FaCheckCircle, 
          color: "text-green-600", 
          bgColor: "bg-green-100" 
        },
        { 
          label: "Pending", 
          value: statsData.statusCounts.submitted.toString(), 
          icon: FaClock, 
          color: "text-yellow-600", 
          bgColor: "bg-yellow-100" 
        },
        { 
          label: "Active Users", 
          value: "156", // TODO: Implement user count endpoint
          icon: FaUsers, 
          color: "text-purple-600", 
          bgColor: "bg-purple-100" 
        },
      ];

      setStats(updatedStats);

      // Format recent complaints data
      const formattedComplaints = complaintsData.map(complaint => ({
        id: complaint.complaint_id,
        category: complaint.category,
        status: formatStatus(complaint.status),
        date: new Date(complaint.created_at).toLocaleDateString('en-CA'),
        priority: complaint.priority || 'Medium' // Default priority if not set
      }));

      setRecentComplaints(formattedComplaints);

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'submitted':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
      case 'closed':
        return 'Resolved';
      default:
        return status;
    }
  };

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
      <div className="bg-green-800 rounded-xl shadow-lg p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1
              className="text-3xl lg:text-4xl font-bold mb-2"
              style={{ color: "#ffffff" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-lg" style={{ color: "#ffffff" }}>
              Here's your system overview.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <FaChartLine className="mr-2 text-black" />
              <span className="text-sm text-black font-medium">System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button 
            onClick={fetchAdminDashboardData}
            className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-green-600 text-2xl mr-3" />
          <span className="text-gray-600">Loading admin dashboard data...</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bgColor }, idx) => (
          <div key={idx} className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
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
      <div className="bg-white shadow-sm rounded-xl border border-gray-200">
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
              {recentComplaints.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p>No complaints found.</p>
                  </td>
                </tr>
              ) : (
                recentComplaints.map(({ id, category, status, date, priority }) => (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700 capitalize">{category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium capitalize ${getPriorityColor(priority)}`}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
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

        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
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

        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
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
