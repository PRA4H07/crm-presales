import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const steps = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Booked",
  "Lost",
];

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [priorityScore] = useState(() => Math.floor(Math.random() * 41) + 60);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await axiosInstance.put(`/leads/${id}/status`, {
        status: newStatus,
      });

      setLead(res.data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await axiosInstance.get(`/leads/${id}`);
        setLead(res.data);
      } catch (err) {
        setLead(undefined);
      }
    }

    fetchLead();
  }, [id]);

  if (lead === null) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-slate-600">Loading...</p>
      </section>
    );
  }

  if (lead === undefined) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <p className="text-sm text-slate-600">Lead not found.</p>
      </section>
    );
  }

  const statusLabel = (lead.status || "New").toUpperCase();

  let currentStepIndex = steps.indexOf(lead.status);
  if (currentStepIndex === -1) {
    const lower = (lead.status || "").toLowerCase();
    currentStepIndex = steps.findIndex((step) => step.toLowerCase() === lower);
  }
  if (currentStepIndex === -1) {
    currentStepIndex = 0;
  }

  const displayName =
    lead.name ||
    [lead.firstName, lead.middleName, lead.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "—";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Lead progress
            </h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-start">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="flex items-start">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleStatusChange(step)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleStatusChange(step);
                        }
                      }}
                      className="flex w-24 cursor-pointer flex-col items-center text-center transition-all duration-200"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                          isCurrent
                            ? "bg-blue-600 text-white shadow-md"
                            : isCompleted
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`mt-2 text-xs leading-tight ${isCurrent ? "font-semibold text-blue-700" : "text-slate-600"}`}
                      >
                        {step}
                      </p>
                    </div>
                    {index < steps.length - 1 ? (
                      <div
                        className={`mt-5 h-0.5 w-12 rounded-full transition-all duration-200 ${
                          index < currentStepIndex ? "bg-blue-200" : "bg-slate-200"
                        }`}
                      />
                    ) : null}
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Lead information
            </h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong className="text-slate-900">Name:</strong> {displayName}
              </p>
              <p>
                <strong className="text-slate-900">Email:</strong>{" "}
                {lead.email || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Phone:</strong>{" "}
                {lead.phone || "—"}
              </p>
              <p>
                <strong className="text-slate-900">Source:</strong>{" "}
                {lead.source || "Direct"}
              </p>
              <p>
                <strong className="text-slate-900">Created:</strong>{" "}
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <strong className="text-slate-900">Budget:</strong>{" "}
                {lead.budget ? `₹ ${lead.budget.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              AI Insights
            </h2>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Priority Score:</strong>{" "}
              {priorityScore}
            </p>
            <p className="mt-3 text-sm text-slate-600">
              <strong className="text-slate-900">Suggested action:</strong>{" "}
              Follow up with client
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LeadDetails;
