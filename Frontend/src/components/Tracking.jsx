import React, { useState } from "react";
const statusSteps = [
  { label: "Pending", color: "bg-yellow-500" },
  { label: "In Review", color: "bg-blue-500" },
  { label: "Resolved", color: "bg-green-500" },
];
const TrackStatus = () => {
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

  // Sample recent complaints for demonstration
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
  // Find the current step index
  const currentStepIndex = status
    ? statusSteps.findIndex((step) => step.label === status.status)
    : -1;
  const getStatusColor = (statusText) => {
    if (statusText === "Resolved") return "text-green-600 bg-green-100";
    if (statusText === "In Review") return "text-blue-600 bg-blue-100";
    return "text-yellow-600 bg-yellow-100";
  };
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
        Track Complaint Status
      </h2>
      <div className="flex gap-3 mb-8 max-w-md mx-auto">
        <input
          type="text"
          className="input input-bordered w-full bg-white text-black border-green-300 focus:border-green-500"
          placeholder="Enter Complaint ID"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
        />
        <button
          onClick={handleTrack}
          disabled={loading || !complaintId}
          className="btn bg-blue-600 hover:bg-blue-700 text-white border-none px-6"
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Track"
          )}
        </button>
      </div>
      {/* Quick Track Section */}
      {!status && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Track Examples */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Track</h3>
            <p className="text-gray-600 mb-4">Click on any complaint ID below to see tracking demo:</p>
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
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
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">How to Track Your Complaint</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium text-green-800">Enter Complaint ID</p>
                  <p className="text-sm text-green-600">Use the 5-digit ID you received when filing your complaint</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium text-green-800">Click Track</p>
                  <p className="text-sm text-green-600">Get real-time status updates and history</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium text-green-800">View Results</p>
                  <p className="text-sm text-green-600">See progress, history, and resolution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Status Info Section */}
      {!status && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Status Meanings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 rounded-full w-4 h-4" />
              <div>
                <p className="font-medium text-gray-900">Pending</p>
                <p className="text-sm text-gray-600">Complaint received and awaiting review.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full w-4 h-4" />
              <div>
                <p className="font-medium text-gray-900">In Review</p>
                <p className="text-sm text-gray-600">Being processed by relevant department.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full w-4 h-4" />
              <div>
                <p className="font-medium text-gray-900">Resolved</p>
                <p className="text-sm text-gray-600">Issue has been addressed and closed.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Complaint Status Display */}
      {status && status !== "not-found" && (
        <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-green-400">
              Complaint ID: {status.id}
            </h3>
            <button
              onClick={() => setStatus(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-2 mb-6">
            <p className="text-gray-200">
              <span className="font-semibold text-white">Issue:</span> {status.title}
            </p>
            <p className="text-gray-200">
              <span className="font-semibold text-white">Status:</span>{" "}
              <span
                className={`font-semibold ${
                  status.status === "Resolved"
                    ? "text-green-400"
                    : status.status === "In Review"
                    ? "text-blue-400"
                    : "text-yellow-400"
                }`}
              >
                {status.status}
              </span>
            </p>
            <p className="text-gray-200">
              <span className="font-semibold text-white">Department:</span>{" "}
              {status.department}
            </p>
            <p className="text-gray-200">
              <span className="font-semibold text-white">Last Updated:</span>{" "}
              {status.lastUpdate}
            </p>
          </div>
          {/* Status Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {statusSteps.map((step, idx) => (
                <div key={step.label} className="flex flex-col items-center z-10 bg-gray-800 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${idx <= currentStepIndex ? step.color : "bg-gray-600"}
                    `}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium text-center ${
                      idx <= currentStepIndex ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-600 -z-10">
                <div
                  className="h-1 bg-green-500 transition-all duration-500"
                  style={{
                    width:
                      currentStepIndex >= 0
                        ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>
          {/* Status History */}
          {status.history && (
            <div>
              <h4 className="font-semibold mb-4 text-green-400 text-lg">Status History</h4>
              <div className="border-l-2 border-green-400 pl-4 space-y-4">
                {status.history.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className={`w-3 h-3 rounded-full -ml-6 bg-green-400 border-2 border-gray-800`}
                      ></div>
                      <span className="font-semibold text-white">{event.step}</span>
                      <span className="text-xs text-gray-400 ml-auto">{event.date}</span>
                    </div>
                    <div className="ml-2 text-sm text-gray-300 pb-2">{event.remark}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Not found & Help Section */}
      {status === "not-found" && (
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-2xl mx-auto">
          <p className="text-red-600 font-medium text-lg mb-2">
            ❌ No complaint found with ID: {complaintId}
          </p>
          <p className="text-gray-600 mb-4">Please check the complaint ID and try again.</p>
          <button
            onClick={() => setStatus(null)}
            className="btn bg-green-600 hover:bg-green-700 text-white border-none"
          >
            Try Another ID
          </button>
        </div>
      )}
      {!status && (
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you can't find your complaint ID or need assistance, contact our support team.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn btn-outline">📞 Call Support</button>
            <button className="btn btn-outline">✉️ Email Us</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackStatus;
