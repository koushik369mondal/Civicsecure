import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import Layout from "./Layout";

const STATUS_STEPS = [
  { label: "Pending", color: "bg-yellow-500" },
  { label: "In Review", color: "bg-blue-500" },
  { label: "Resolved", color: "bg-green-500" },
];

const QUICK_LIST = [
  { id: "12345", title: "Pothole near Market Road", status: "In Review" },
  { id: "67890", title: "Street Light not working", status: "Resolved" },
  { id: "54321", title: "Garbage collection delay", status: "Pending" },
];

const MOCK = {
  "12345": {
    id: "12345",
    title: "Pothole near Market Road",
    status: "In Review",
    lastUpdate: "2025-09-12",
    department: "Municipal Corporation",
    location: "Market Road, Ward 12",
    description:
      "Major pothole causing slow traffic and minor accidents during rain.",
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
    location: "Main Street, Block A",
    description: "Two consecutive lights are off, lane stays dark at night.",
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
    location: "Green Valley Apartments",
    description: "No pickup for the last 3 days, bins overflowing.",
    history: [{ step: "Pending", date: "2025-09-14", remark: "Complaint filed" }],
  },
};

function getStatusPill(status) {
  if (status === "Resolved") return "text-green-700 bg-green-100";
  if (status === "In Review") return "text-blue-700 bg-blue-100";
  return "text-amber-700 bg-amber-100";
}

function Tracking() {
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null); // null | object | "not-found"

  // Align with Dashboard header scale and spacing
  const header = useMemo(
    () => ({
      titleClass: "text-4xl font-bold text-gray-900 mb-2",
      subClass: "text-gray-700 text-base",
      pageWrap: "space-y-8 w-full max-w-7xl mx-auto",
      card: "bg-white rounded-lg shadow-md border border-gray-200",
      pad: "p-6",
    }),
    []
  );

  const runLookup = (id) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    // Simulate network
    setTimeout(() => {
      const found = MOCK[id.trim()];
      setRecord(found || "not-found");
      setLoading(false);
    }, 800);
  };

  const onTrackClick = () => runLookup(complaintId);

  const onQuickClick = (id) => {
    setComplaintId(id);
    runLookup(id);
  };

  const currentStepIndex =
    record && record !== "not-found"
      ? STATUS_STEPS.findIndex((s) => s.label === record.status)
      : -1;

  // Keep layout consistent when no selection yet
  const showIntro = !record;

  useEffect(() => {
    // If Dashboard stored a selected complaint ID, prefill and search
    const saved = localStorage.getItem("selectedComplaintId");
    if (saved) {
      setComplaintId(saved);
      localStorage.removeItem("selectedComplaintId");
      runLookup(saved);
    }
  }, []);

  return (
    <Layout>
      <div className={header.pageWrap}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={header.titleClass}>Track Complaint Status</h1>
            <p className={header.subClass}>
              Enter a complaint ID or pick from quick examples to view progress
            </p>
          </div>
        </div>

        {/* Search bar (aligned to 7xl container) */}
        <div className={`${header.card}`}>
          <div className={`${header.pad}`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center max-w-2xl">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Complaint ID (e.g., 12345)"
                  className="pl-10 pr-3 py-3 w-full bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onTrackClick();
                  }}
                />
              </div>
              <button
                disabled={loading || !complaintId.trim()}
                onClick={onTrackClick}
                className={`px-5 py-3 rounded-md text-white font-medium transition-colors ${loading || !complaintId.trim()
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
                aria-label="Track complaint by ID"
              >
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>
          </div>
        </div>

        {/* Intro blocks (quick track + how-to + legend) */}
        {showIntro && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Track */}
              <div className={`${header.card}`}>
                <div className={header.pad}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Quick Track
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Click any complaint to preview tracking:
                  </p>
                  <div className="space-y-3">
                    {QUICK_LIST.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onQuickClick(c.id)}
                        className="w-full text-left flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            ID: {c.id}
                          </p>
                          <p className="text-sm text-gray-600">{c.title}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusPill(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* How to Track */}
              <div className={`${header.card} bg-green-50`}>
                <div className={header.pad}>
                  <h3 className="text-xl font-semibold text-green-900 mb-4">
                    How to Track Your Complaint
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        n: 1,
                        t: "Enter Complaint ID",
                        s: "Use the ID you received after filing the complaint.",
                      },
                      {
                        n: 2,
                        t: "Click Track",
                        s: "We’ll fetch the latest status and history.",
                      },
                      {
                        n: 3,
                        t: "View Results",
                        s: "See progress timeline and resolution details.",
                      },
                    ].map((i) => (
                      <div key={i.n} className="flex items-start gap-3">
                        <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {i.n}
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{i.t}</p>
                          <p className="text-sm text-green-700">{i.s}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className={`${header.card}`}>
              <div className={header.pad}>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  Status Meanings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      c: "bg-yellow-500",
                      t: "Pending",
                      d: "Complaint received and awaiting review.",
                    },
                    {
                      c: "bg-blue-500",
                      t: "In Review",
                      d: "Being processed by the department.",
                    },
                    {
                      c: "bg-green-500",
                      t: "Resolved",
                      d: "Issue addressed and closed.",
                    },
                  ].map((x) => (
                    <div key={x.t} className="flex items-center gap-3">
                      <div className={`${x.c} rounded-full w-4 h-4`} />
                      <div>
                        <p className="font-medium text-gray-900">{x.t}</p>
                        <p className="text-sm text-gray-600">{x.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Result card */}
        {record && record !== "not-found" && (
          <div className={`${header.card}`}>
            <div className={`${header.pad}`}>
              {/* Title row */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {record.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusPill(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium text-gray-800">ID:</span>{" "}
                    {record.id} •{" "}
                    <span className="font-medium text-gray-800">Dept:</span>{" "}
                    {record.department}
                  </p>
                </div>
                <button
                  onClick={() => setRecord(null)}
                  className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  <FaTimes /> Close
                </button>
              </div>

              {/* Details */}
              {(record.location || record.description || record.lastUpdate) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">
                      {record.location || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 md:col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-900">
                      {record.description || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {record.lastUpdate || "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="mt-8">
                <div className="flex items-center justify-between relative">
                  {STATUS_STEPS.map((step, idx) => (
                    <div
                      key={step.label}
                      className="flex flex-col items-center z-10 bg-white px-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx <= currentStepIndex ? step.color : "bg-gray-300"
                          }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${idx <= currentStepIndex
                            ? "text-gray-900"
                            : "text-gray-400"
                          }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                  {/* Progress line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                    <div
                      className="h-1 bg-green-500 transition-all duration-500"
                      style={{
                        width:
                          currentStepIndex >= 0
                            ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) *
                            100
                            }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* History */}
              {Array.isArray(record.history) && record.history.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Status History
                  </h4>
                  <div className="border-l-2 border-green-500 pl-4 space-y-4">
                    {record.history.map((ev, i) => (
                      <div key={`${ev.step}-${i}`} className="relative">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-3 h-3 rounded-full -ml-6 bg-green-500 border-2 border-white" />
                          <span className="font-medium text-gray-900">
                            {ev.step}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {ev.date}
                          </span>
                        </div>
                        <p className="ml-2 text-sm text-gray-700">{ev.remark}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Not Found */}
        {record === "not-found" && (
          <div className={`${header.card}`}>
            <div className={`${header.pad}`}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3">
                  <FaEye />
                </div>
                <p className="text-red-600 font-semibold text-lg mb-1">
                  No complaint found with ID: {complaintId}
                </p>
                <p className="text-gray-600 mb-4">
                  Please verify the ID and try again.
                </p>
                <button
                  onClick={() => setRecord(null)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                >
                  Try Another ID
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Tracking;
