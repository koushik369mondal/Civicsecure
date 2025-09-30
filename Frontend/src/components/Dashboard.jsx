import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaEye, FaPlus, FaSpinner } from "react-icons/fa";
import Layout from "./Layout";
import { complaintAPI } from "../services/api";

function Dashboard({ setCurrentPage }) {
  const [stats, setStats] = useState([
    { label: "Total Complaints", value: "-", icon: FaExclamationTriangle, color: "text-green-600" },
    { label: "Resolved", value: "-", icon: FaCheckCircle, color: "text-green-700" },
    { label: "Pending", value: "-", icon: FaClock, color: "text-amber-500" },
    { label: "In Review", value: "-", icon: FaEye, color: "text-blue-600" }
  ]);

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let statsData = null;
      let complaintsData = [];

      // Try authenticated endpoints first, fall back to public endpoints
      try {
        // Try to fetch user-specific stats
        const statsResponse = await complaintAPI.getUserComplaintStats();
        statsData = statsResponse.data.data;
        
        // Try to fetch user-specific complaints
        const complaintsResponse = await complaintAPI.getUserComplaints({ limit: 3, sort: 'created_at', order: 'DESC' });
        complaintsData = complaintsResponse.data.data;
        
      } catch (authError) {
        console.log('Authentication failed, falling back to public endpoints:', authError);
        
        // Fallback to public endpoints
        try {
          // Use public stats endpoint
          const publicStatsResponse = await complaintAPI.getComplaintStats();
          const publicStats = publicStatsResponse.data.stats;
          
          // Convert public stats format to match user stats format
          statsData = {
            totalComplaints: publicStats.total,
            statusCounts: {
              submitted: publicStats.status.pending,
              inProgress: publicStats.status.in_progress,
              resolved: publicStats.status.resolved,
              closed: publicStats.status.closed
            }
          };
          
          // Use public recent complaints endpoint
          const publicComplaintsResponse = await complaintAPI.getRecentComplaints({ limit: 3 });
          complaintsData = publicComplaintsResponse.data.complaints || [];
          
        } catch (publicError) {
          console.error('Both authenticated and public endpoints failed:', publicError);
          throw new Error('Unable to fetch data from any endpoint');
        }
      }

      // Update stats with real data
      const updatedStats = [
        { 
          label: "Total Complaints", 
          value: statsData.totalComplaints.toString(), 
          icon: FaExclamationTriangle, 
          color: "text-green-600" 
        },
        { 
          label: "Resolved", 
          value: (statsData.statusCounts.resolved + statsData.statusCounts.closed).toString(), 
          icon: FaCheckCircle, 
          color: "text-green-700" 
        },
        { 
          label: "Pending", 
          value: statsData.statusCounts.submitted.toString(), 
          icon: FaClock, 
          color: "text-amber-500" 
        },
        { 
          label: "In Review", 
          value: statsData.statusCounts.inProgress.toString(), 
          icon: FaEye, 
          color: "text-blue-600" 
        }
      ];

      setStats(updatedStats);

      // Format recent complaints data
      const formattedComplaints = complaintsData.map(complaint => ({
        id: complaint.complaint_id,
        category: complaint.category,
        status: formatStatus(complaint.status),
        date: new Date(complaint.created_at).toLocaleDateString('en-CA') // Format as YYYY-MM-DD
      }));

      setRecentComplaints(formattedComplaints);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
        return 'In Review';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Resolved';
      default:
        return status;
    }
  };

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
            <button 
              onClick={fetchDashboardData}
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
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        )}

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
            
            {recentComplaints.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <p>No complaints found. Start by filing your first complaint.</p>
                <button
                  onClick={() => setCurrentPage("file-complaint")}
                  className="mt-3 text-green-600 hover:text-green-800 underline"
                >
                  File a complaint
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {recentComplaints.map(({ id, category, status, date }) => (
                    <div key={id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{id}</p>
                        <p className="text-sm text-gray-700 capitalize">{category}</p>
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
                  <button 
                    className="px-4 py-2 border border-green-300 text-gray-900 hover:bg-green-50 hover:border-green-400 rounded-md font-medium transition-colors"
                    onClick={() => setCurrentPage("tracking")}
                  >
                    View All
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
