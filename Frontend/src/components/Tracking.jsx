import React, { useState } from "react";
import Layout from "./Layout";

const statusSteps = [
  { label: "Pending", color: "bg-yellow-500" },
  { label: "In Review", color: "bg-blue-500" },
  { label: "Resolved", color: "bg-green-500" },
];

const TrackStatus = ({ sidebarOpen, setSidebarOpen, user, onLogout, currentPage, setCurrentPage }) => {
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Mock status data
  const mockStatus = {
    "12345": {
      id: "12345",
      title: "Pothole near Market Road",
      status: "In Review",
      lastUpdate: "2025-09-12",
      department: "Municipal Corporation",
      history: [
        { step: "Pending", date: "2025-09-10", remark: "Complaint filed" },
        { step: "In Review", date: "2025-09-12", remark: "Assigned to officer" },
      ],
    },
    "67890": {
      id: "67890",
      title: "Street Light not working",
      status: "Resolved",
      lastUpdate: "2025-09-10",
      department: "Electricity Board",
      history: [
        { step: "Pending", date: "2025-09-08", remark: "Complaint filed" },
        { step: "In Review", date: "2025-09-09", remark: "Inspection scheduled" },
        { step: "Resolved", date: "2025-09-10", remark: "Issue fixed" },
      ],
    },
    "54321": {
      id: "54321",
      title: "Garbage collection delay",
      status: "Pending",
      lastUpdate: "2025-09-14",
      department: "Sanitation",
      history: [
        { step: "Pending", date: "2025-09-14", remark: "Complaint filed" },
      ],
    },
  };

  const recentComplaints = [
    { id: "12345", title: "Pothole near Market Road", status: "In Review" },
    { id: "67890", title: "Street Light not working", status: "Resolved" },
    { id: "54321", title: "Garbage collection delay", status: "Pending" },
  ];

  const handleTrack = () => {
    setLoading(true);
    setTimeout(() => {
      setStatus(mockStatus[complaintId] || "not-found");
      setLoading(false);
    }, 1500);
  };

  const handleQuickTrack = (id) => {
    setComplaintId(id);
    setLoading(true);
    setTimeout(() => {
      setStatus(mockStatus[id] || "not-found");
      setLoading(false);
    }, 1000);
  };

  const currentStepIndex = status
    ? statusSteps.findIndex((step) => step.label === status.status)
    : -1;

  const getStatusColor = (statusText) => {
    if (statusText === "Resolved") return "text-green-600 bg-green-100";
    if (statusText === "In Review") return "text-blue-600 bg-blue-100";
    return "text-yellow-600 bg-yellow-100";
  };

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      user={user}
      onLogout={onLogout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Complaint Status</h2>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Complaint ID"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
            />
            <button
              onClick={handleTrack}
              disabled={loading || !complaintId}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:bg-gray-400"
            >
              {loading ? "..." : "Track"}
            </button>
          </div>
        </div>

        {/* Quick Track & Instructions */}
        {!status && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Track Examples */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Track</h3>
              <p className="text-gray-600 mb-4">Click any complaint ID below for demo:</p>
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleQuickTrack(complaint.id)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">ID: {complaint.id}</p>
                      <p className="text-sm text-gray-600">{complaint.title}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Track */}
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Track</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Enter Complaint ID", desc: "Use the 5-digit ID you received" },
                  { step: "2", title: "Click Track", desc: "Get real-time status updates" },
                  { step: "3", title: "View Results", desc: "See progress and history" },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {step}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{title}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Meanings */}
        {!status && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Meanings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { color: "bg-yellow-500", status: "Pending", desc: "Complaint received and awaiting review" },
                { color: "bg-blue-500", status: "In Review", desc: "Being processed by relevant department" },
                { color: "bg-green-500", status: "Resolved", desc: "Issue has been addressed and closed" },
              ].map(({ color, status, desc }) => (
                <div key={status} className="flex items-center gap-3">
                  <div className={`${color} rounded-full w-4 h-4`} />
                  <div>
                    <p className="font-medium text-gray-900">{status}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complaint Status Display */}
        {status && status !== "not-found" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Complaint ID: {status.id}
              </h3>
              <button
                onClick={() => setStatus(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600"><span className="font-semibold">Issue:</span> {status.title}</p>
                <p className="text-gray-600"><span className="font-semibold">Department:</span> {status.department}</p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold">Status:</span>{" "}
                  <span className={`font-semibold ${
                    status.status === "Resolved" ? "text-green-600" :
                    status.status === "In Review" ? "text-blue-600" : "text-yellow-600"
                  }`}>
                    {status.status}
                  </span>
                </p>
                <p className="text-gray-600"><span className="font-semibold">Last Updated:</span> {status.lastUpdate}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {statusSteps.map((step, idx) => (
                  <div key={step.label} className="flex flex-col items-center z-10 bg-white px-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                        ${idx <= currentStepIndex ? step.color : "bg-gray-400"}
                      `}
                    >
                      {idx + 1}
                    </div>
                    <span className={`mt-2 text-sm font-medium text-center ${
                      idx <= currentStepIndex ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 -z-10">
                  <div
                    className="h-1 bg-green-500 transition-all duration-500"
                    style={{
                      width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Status History */}
            {status.history && (
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 text-lg">Status History</h4>
                <div className="border-l-2 border-green-500 pl-4 space-y-4">
                  {status.history.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-3 h-3 rounded-full -ml-6 bg-green-500 border-2 border-white" />
                        <span className="font-semibold text-gray-900">{event.step}</span>
                        <span className="text-xs text-gray-500 ml-auto">{event.date}</span>
                      </div>
                      <div className="ml-2 text-sm text-gray-600 pb-2">{event.remark}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Not found */}
        {status === "not-found" && (
          <div className="bg-white shadow rounded-lg p-6 text-center border-l-4 border-red-500">
            <p className="text-red-600 font-medium text-lg mb-2">
              ❌ No complaint found with ID: {complaintId}
            </p>
            <p className="text-gray-600 mb-4">Please check the complaint ID and try again.</p>
            <button
              onClick={() => setStatus(null)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Try Another ID
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackStatus;
